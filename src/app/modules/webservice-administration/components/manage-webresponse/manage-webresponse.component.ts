import { ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WebserviceAdministrationComponent } from '../../webservice-administration.component';
import { TreeNode } from 'primeng/api';
// Lazy-load leader-line at runtime in the browser to avoid SSR/global SVG issues
// import LeaderLine from 'leader-line-new';
import { Popover } from 'primeng/popover';
import { ManageAttributeComponent } from '../manage-attribute/manage-attribute.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { map } from 'rxjs';

@Component({
  selector: 'app-manage-webresponse',
  standalone: false,
  templateUrl: './manage-webresponse.component.html',
  styleUrl: './manage-webresponse.component.css'
})
export class ManageWebresponseComponent extends WebserviceAdministrationComponent {
  // Will hold the dynamically imported LeaderLine constructor
  private LeaderLineRef: any = null;
  /**
  *@property {FormGroup} wsResForm - Form group that holds application form controls.
  */
  wsResForm: FormGroup;


  @ViewChild('op') op!: Popover;

  sourceTree: TreeNode[] = [];
  targetTree: TreeNode[] = [];

  selectedSourceNode?: TreeNode;
  selectedTargetNode?: TreeNode;
  editingNode: any = null;
  editingLabel: string | undefined = '';

  mappings: { sourceId: string; targetId: string; line: any }[] = [];

  baseEditorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  };


  responseOptions = { ...this.baseEditorOptions, readOnly: true };
  
  // Track response type for editor language
  private responseType: 'json' | 'xml' = 'json';

  wsResponse: any; // Formatted string (JSON stringified or XML string)
  private parsedResponseData: any = null; // Parsed data (object/array) for use in buildSaveObject

  @ViewChild('cardContainer', { read: ElementRef }) leftPanel!: ElementRef;
  @ViewChild('targetPanel', { read: ElementRef }) rightPanel!: ElementRef;

  private leftScrollRoot: HTMLElement | null = null;
  private rightScrollRoot: HTMLElement | null = null;


  // Observers & helpers
  private mutationObserver?: MutationObserver;
  private resizeObserver?: ResizeObserver;

  private io: IntersectionObserver | null = null;
  private leftIO: IntersectionObserver | null = null;
  private rightIO: IntersectionObserver | null = null;
  private observedIds = new Set<string>();

  // throttling redraw
  private _redrawTimeout: any;

  // scroll state helpers
  private _scrolling = false;
  private _scrollStopTimer: any = null;
  private readonly SCROLL_STOP_DEBOUNCE = 250;

  // quick map of element visibility state (true = visible inside its observer root)
  private visibility = new Map<string, boolean>();

  // Track visibility state globally
  private srcVisibility: Map<string, boolean> = new Map();
  private tgtVisibility: Map<string, boolean> = new Map();

  // debounce for recreating observers
  private _recreateObserversTimer: any = null;
  private readonly RECREATE_OBSERVERS_DEBOUNCE = 80;

  // ---------------------------
  // Constructor & lifecycle
  // ---------------------------

  /**
 * @constructor
 * @param {DynamicDialogConfig} dialogConfig - Configuration for the dynamic dialog.
 * @param {DynamicDialogRef} ref - Reference to the dynamic dialog instance.
 * @param {FormBuilder} fb - Form builder service for handling reactive forms.
 */
  constructor(
    public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef
  ) {
    super();

    this.wsResForm = this.fb.group({
      _id: new FormControl<string>(''),
      wsResponse: new FormControl<string>(''),
      wsMap: new FormControl<string>(''),
    });

    // Patch id if present
    this.wsResForm.patchValue({
      _id: this.dialogConfig.data?._id
    });

    // Patch wsResponse (can be JSON or XML)
    this.patchValue(this.dialogConfig.data?.wsResData);

    const wsMapData = this.dialogConfig.data?.wsMapData;

    if (wsMapData?.mappedField && Object.keys(wsMapData.mappedField).length > 0) {
      // Patch full wsMap
      this.wsResForm.patchValue({ wsMap: wsMapData });

      console.log('Existing mapping detected:', wsMapData.mappedField);

      // Restore stored structures (if they exist)
      this.sourceTree = wsMapData.sourceTree ?? [];
      this.targetTree = wsMapData.targetTree ?? [];

      // Safety: if trees are missing but external/internal fields exist, rebuild them
      if ((!this.sourceTree.length && wsMapData.externalField?.length) ||
        (!this.targetTree.length && wsMapData.internalField?.length)) {
        this.sourceTree = wsMapData.externalField.map((ext: string) => ({
          key: `source-${ext}`,
          label: ext,
          data: { fieldName: ext },
          type: 'external'
        }));
        this.targetTree = wsMapData.internalField.map((int: string) => ({
          key: `target-${int}`,
          label: int,
          data: { fieldName: int },
          type: 'internal'
        }));
      }

      // Restore mappings safely
      this.mappings = (wsMapData.mappings ?? []).map((m: any) => ({
        sourceId: m.sourceId,
        targetId: m.targetId,
        line: null
      }));

      // Wait for DOM render, then redraw lines
      this.ngZone.onStable.pipe().subscribe(() => {

        setTimeout(() => {
          this.redrawLines();
        });

      });
    }
  }


  async ngAfterViewInit() {
    // Dynamically import leader-line only in the browser after view init
    try {
      const mod: any = await import('leader-line-new');
      this.LeaderLineRef = mod?.default ?? mod;
    } catch (e) {
      console.warn('Failed to load leader-line-new dynamically:', e);
    }
    // Use ngZone.runOutsideAngular to avoid change detection storms when listening to scroll/resize
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this._onWindowResize);

      // attach scroll roots (and re-create observers if needed)
      this._attachScrollRoots();

      // MutationObserver to detect tree structure changes (expand/collapse/add/remove)
      this.mutationObserver = new MutationObserver(() => {
        this._throttledRedraw();
      });

      const observeTarget = this.leftPanel?.nativeElement || document.body;
      this.mutationObserver.observe(observeTarget, { childList: true, subtree: true, attributes: true, characterData: false });

      // Optional: ResizeObserver to detect dimension changes of the container or nodes
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => this._throttledRedraw());
        this.resizeObserver.observe(document.body);
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this._onWindowResize);
    // left panel listeners
    if (this.leftPanel?.nativeElement) {
      const left = this.leftPanel.nativeElement;
      left.removeEventListener('scroll', this._onPanelScroll);
      left.removeEventListener('wheel', this._onPanelScroll);
      left.removeEventListener('touchmove', this._onPanelScroll);
    }

    // right panel listeners
    if (this.rightPanel?.nativeElement) {
      const right = this.rightPanel.nativeElement;
      right.removeEventListener('scroll', this._onPanelScroll);
      right.removeEventListener('wheel', this._onPanelScroll);
      right.removeEventListener('touchmove', this._onPanelScroll);
    }

    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();
    // disconnect intersection observer and unobserve elements
    if (this.io) {
      try {
        this.observedIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) this.io!.unobserve(el);
        });
        this.io.disconnect();
      } catch (e) { /* ignore */ }
      this.io = null;
      this.observedIds.clear();
    }

    if (this.leftIO) {
      this.leftIO.disconnect();
      this.leftIO = null;
    }
    if (this.rightIO) {
      this.rightIO.disconnect();
      this.rightIO = null;
    }

    // clear any running timers
    if (this._scrollStopTimer) {
      clearTimeout(this._scrollStopTimer);
      this._scrollStopTimer = null;
    }

    this.clearMappings();
  }


  // Re-attach scroll roots safely (call after DOM updates)
  private _attachScrollRoots() {
    // find .p-tree in left/right wrappers (may change after expand/collapse)
    const newLeft = this.leftPanel?.nativeElement ? this.leftPanel.nativeElement.querySelector('.p-tree') : null;
    const newRight = this.rightPanel?.nativeElement ? this.rightPanel.nativeElement.querySelector('.p-tree') : null;

    // if changed, remove previous listeners and attach new ones
    if (newLeft !== this.leftScrollRoot) {
      if (this.leftScrollRoot) {
        this.leftScrollRoot.removeEventListener('scroll', this._onPanelScroll);
        this.leftScrollRoot.removeEventListener('wheel', this._onPanelScroll);
        this.leftScrollRoot.removeEventListener('touchmove', this._onPanelScroll);
      }
      this.leftScrollRoot = newLeft as HTMLElement | null;
      if (this.leftScrollRoot) {
        this.leftScrollRoot.addEventListener('scroll', this._onPanelScroll);
        this.leftScrollRoot.addEventListener('wheel', this._onPanelScroll, { passive: true });
        this.leftScrollRoot.addEventListener('touchmove', this._onPanelScroll, { passive: true });
      }
      this._debouncedRecreateObservers();
    }

    if (newRight !== this.rightScrollRoot) {
      if (this.rightScrollRoot) {
        this.rightScrollRoot.removeEventListener('scroll', this._onPanelScroll);
        this.rightScrollRoot.removeEventListener('wheel', this._onPanelScroll);
        this.rightScrollRoot.removeEventListener('touchmove', this._onPanelScroll);
      }
      this.rightScrollRoot = newRight as HTMLElement | null;
      if (this.rightScrollRoot) {
        this.rightScrollRoot.addEventListener('scroll', this._onPanelScroll);
        this.rightScrollRoot.addEventListener('wheel', this._onPanelScroll, { passive: true });
        this.rightScrollRoot.addEventListener('touchmove', this._onPanelScroll, { passive: true });
      }
      this._debouncedRecreateObservers();
    }
  }

  private _debouncedRecreateObservers() {
    if (this._recreateObserversTimer) clearTimeout(this._recreateObserversTimer);
    this._recreateObserversTimer = setTimeout(() => {
      this._recreateObserversTimer = null;
      this._recreateObservers();
    }, this.RECREATE_OBSERVERS_DEBOUNCE);
  }

  // Fully disconnect and null out current IOs
  private _disconnectObserversFully() {
    try {
      if (this.leftIO) {
        this.leftIO.disconnect();
        this.leftIO = null;
      }
      if (this.rightIO) {
        this.rightIO.disconnect();
        this.rightIO = null;
      }
      if (this.io) {
        this.io.disconnect();
        this.io = null;
      }
    } catch (e) {
      // ignore
    }
  }


  // Recreate observers based on current scroll roots, and re-observe existing elements
  private _recreateObservers() {
    // ensure scroll roots are up to date
    this._attachScrollRoots();

    // disconnect existing
    this._disconnectObserversFully();

    // create with current roots; use multiple thresholds for better granularity
    const callback = (entries: IntersectionObserverEntry[]) => {
      // run inside ngZone so UI updates / CD work correctly
      this.ngZone.run(() => {
        entries.forEach(entry => this.onIntersectionChange(entry));
      });
    };

    try {
      // If we have scroll roots, scope each observer; otherwise fallback to viewport
      const leftRoot = this.leftScrollRoot || null;
      const rightRoot = this.rightScrollRoot || null;

      // Use threshold array for better on/off detection (small threshold helps)
      const optionsLeft = { root: leftRoot, threshold: [0, 0.05, 0.5, 1] as any };
      const optionsRight = { root: rightRoot, threshold: [0, 0.05, 0.5, 1] as any };

      this.leftIO = new IntersectionObserver(callback, optionsLeft);
      this.rightIO = new IntersectionObserver(callback, optionsRight);
    } catch (err) {
      console.warn('IntersectionObserver creation failed for panel roots, falling back to viewport', err);
      this.leftIO = this.rightIO = new IntersectionObserver(callback, { root: null, threshold: [0, 0.05, 0.5, 1] as any });
    }

    // Re-observe any previously observed elements
    const existing = Array.from(this.observedIds);
    this.observedIds.clear();
    existing.forEach(id => {
      // attempt to re-observe (observeElementById will add back to observedIds)
      this.observeElementById(id);
    });
  }


  // ---------------------------
  // Event listener wrappers
  // ---------------------------
  // arrow functions to preserve 'this' when used as listener
  private _onWindowResize = () => this.redrawLines();
  private _onPanelScroll = () => {
    // immediate hide (and schedule show after stop)
    this.onScrollStart();
    // throttle redraw for structural changes
    this._throttledRedraw();
  };


  // Lightweight throttle to avoid too many redraws
  private _throttledRedraw() {
    if (this._redrawTimeout) return;
    this._redrawTimeout = setTimeout(() => {
      this.redrawLines();
      this._redrawTimeout = null;
    }, 50);
  }

  // ---------------------------
  // Tree key utilities
  // ---------------------------
  private assignUniqueKeys(nodes: TreeNode[], prefix = '') {
    nodes.forEach((n, i) => {
      const safeLabel = (n.label || 'node').toString().replace(/\s+/g, '_');
      // unique by prefix + index + label
      n.key = prefix ? `${prefix}.${i}.${safeLabel}` : `${i}.${safeLabel}`;
      if (n.children && n.children.length) {
        this.assignUniqueKeys(n.children, n.key);
      }
    });
  }


  toggle(event: any) {
    this.op.toggle(event);
  }


  /**
 * Check if an element is at least `minRatio` visible inside the given container element.
 * If minRatio === 1 -> requires full containment, 0.5 -> half visibility, etc.
 */
  private isElementVisibleInContainerById(id: string, container: Element | null, minRatio = 1): boolean {
    const el = document.getElementById(id);
    if (!el || !container) return false;

    const elRect = el.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    // compute intersection rectangle
    const top = Math.max(elRect.top, contRect.top);
    const left = Math.max(elRect.left, contRect.left);
    const right = Math.min(elRect.right, contRect.right);
    const bottom = Math.min(elRect.bottom, contRect.bottom);

    const intersectionWidth = Math.max(0, right - left);
    const intersectionHeight = Math.max(0, bottom - top);
    const intersectionArea = intersectionWidth * intersectionHeight;
    const elArea = elRect.width * elRect.height;

    if (elArea <= 0) return false;

    const visibleRatio = intersectionArea / elArea;

    return visibleRatio >= minRatio;
  }

  /** convenience wrappers */
  private isSourceVisible(id: string, minRatio = 1) {
    return this.isElementVisibleInContainerById(id, this.leftScrollRoot || null, minRatio);
  }
  private isTargetVisible(id: string, minRatio = 1) {
    return this.isElementVisibleInContainerById(id, this.rightScrollRoot || null, minRatio);
  }

  /**
 * Called indirectly by _onPanelScroll wrapper (keeps 'this' correct).
 * Hides lines immediately when scroll starts and schedules 'show' after scrolling stops.
 */
  private onScrollStart() {
    // if already in scrolling state, just reschedule stop timer
    if (!this._scrolling) {
      this._scrolling = true;
      // hide immediately (fast user feedback)
      try { this.hideAllMappings(); } catch (e) { /* ignore */ }
    }
    // clear any previous stop-timer and schedule a new one
    this.scheduleShowAfterStop();
  }

  private scheduleShowAfterStop() {
    if (this._scrollStopTimer) clearTimeout(this._scrollStopTimer);
    this._scrollStopTimer = setTimeout(() => this.onScrollStop(), this.SCROLL_STOP_DEBOUNCE);
  }

  /**
   * Called when scrolling has stopped (debounced). Attempts to re-create/position lines for visible endpoints.
   */
  private onScrollStop() {
    this._scrolling = false;
    if (this._scrollStopTimer) {
      clearTimeout(this._scrollStopTimer);
      this._scrollStopTimer = null;
    }

    // After scroll stops: attempt to redraw and show lines.
    // We run redraw inside runOutsideAngular to avoid heavy CD cycles; redrawLines will call safeCreateLineForMapping
    // which itself uses runOutsideAngular for LeaderLine creation.
    this.ngZone.runOutsideAngular(() => {
      // small delay to allow any lazy rendering / virtual scroll to stabilise
      setTimeout(() => {
        try {

          this._debouncedRecreateObservers();
          // show or (re)create any lines that were hidden
          // showAllMappings will ensure lines exist (calls safeCreateLineForMapping)
          this.showAllMappings();
        } catch (e) {
          console.warn('onScrollStop error', e);
        }
      }, 20);
    });
  }


  // ---------------------------
  // IntersectionObserver helpers
  // ---------------------------
  private ensureIntersectionObserver() {
    // ensure we at least have observers (create if null)
    if (!this.leftIO || !this.rightIO) this._recreateObservers();
  }

  /** Observe an element by id using the panel-specific observer */
  private observeElementById(id: string) {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;

    // ensure observers exist
    this.ensureIntersectionObserver();

    try {
      if (id.startsWith('source-')) {
        this.leftIO?.observe(el);
      } else if (id.startsWith('target-')) {
        this.rightIO?.observe(el);
      } else {
        // fallback: observe with both so changes are noticed
        this.leftIO?.observe(el);
        this.rightIO?.observe(el);
      }
      // initialize visibility to false until observer reports
      this.visibility.set(id, false);
      this.observedIds.add(id);
    } catch (e) {
      console.warn('Failed to observe element', id, e);
    }
  }

  /** Unobserve element and clear visibility state */
  private unobserveElementById(id: string) {
    if (!id) return;
    const el = document.getElementById(id);
    try {
      if (el) {
        this.leftIO?.unobserve(el);
        this.rightIO?.unobserve(el);
      }
    } catch (e) { /* ignore */ }

    this.visibility.delete(id);
    this.observedIds.delete(id);
  }

  // Called for each IntersectionObserverEntry
  private onIntersectionChange(entry: IntersectionObserverEntry) {
    const el = entry.target as HTMLElement;
    if (!el || !el.id) return;
    const id = el.id;

    // set local visibility quickly from entry (use small tolerance)
    const nowVisible = !!entry.isIntersecting && (entry.intersectionRatio > 0.01);
    this.visibility.set(id, nowVisible);

    // Recompute mapping-level visibility for any related mappings
    // Use strict requirement (1) or relaxed (0.5) depending on your UX
    const requiredRatio = 1;

    // find mappings that reference this element (either side)
    const related = this.mappings.filter(m => m.sourceId === id || m.targetId === id);

    related.forEach(m => {
      try {
        // compute true visibility for both endpoints using your helpers
        const srcVisible = this.isSourceVisible(m.sourceId, requiredRatio);
        const tgtVisible = this.isTargetVisible(m.targetId, requiredRatio);

        // store globally for other logic if needed
        this.srcVisibility.set(m.sourceId, srcVisible);
        this.tgtVisibility.set(m.targetId, tgtVisible);

        // DEBUG
        // console.log('IO:', id, 'entryVisible=', nowVisible, 'srcVisible=', srcVisible, 'tgtVisible=', tgtVisible);

        if (srcVisible && tgtVisible) {
          // both endpoints visible — ensure line exists & is shown
          if (!m.line) {
            this.safeCreateLineForMapping(m);
            // give leaderline a moment to initialise then position/show
            setTimeout(() => {
              try { m.line?.position && m.line.position(); } catch (e) { /* ignore */ }
              try { m.line?.show && m.line.show(); } catch (e) { /* ignore */ }
            }, 10);
          } else {
            try { m.line.position && m.line.position(); } catch (e) { /* ignore */ }
            try { m.line.show && m.line.show(); } catch (e) { /* ignore */ }
          }
        } else {
          // if either endpoint is not visible -> hide & remove line to avoid incorrect anchoring
          if (m.line) {
            try { m.line.hide && m.line.hide(); } catch (e) { /* ignore */ }
            try { m.line.remove && m.line.remove(); } catch (e) { /* ignore */ }
            m.line = null;
          }
        }
      } catch (err) {
        console.warn('onIntersectionChange mapping handling error', m, err);
      }
    });
  }
  // ---------------------------
  // Element / DOM safety helpers
  // ---------------------------
  private isElementConnected(el: Element | null): boolean {
    return !!el && !!((el as any).isConnected || (document.contains && document.contains(el)));
  }

  /**
* Safely create a LeaderLine for a mapping only when both endpoints are connected.
* If endpoints are not connected, store mapping.line = null and try later (e.g. on expand).
*/
  private safeCreateLineForMapping(m: { sourceId: string; targetId: string; line: any }) {
    const sourceEl = document.getElementById(m.sourceId) as HTMLElement | null;
    const targetEl = document.getElementById(m.targetId) as HTMLElement | null;

    if (!this.isElementConnected(sourceEl) || !this.isElementConnected(targetEl)) {
      // endpoints not available now - keep mapping but don't create line
      m.line = null;
      console.debug('safeCreateLineForMapping: endpoints not connected', m.sourceId, m.targetId, { sourceEl, targetEl });
      return;
    }

    // if a previous line exists but endpoints were disconnected earlier, remove it first
    if (m.line) {
      try { m.line.remove(); } catch (e) { /* ignore */ }
      m.line = null;
    }

    try {
      const src = sourceEl as Element;
      const tgt = targetEl as Element;
      // create LeaderLine outside Angular for perf
      this.ngZone.runOutsideAngular(() => {
        if (!this.LeaderLineRef) {
          // Not loaded yet; skip for now. It will be retried on next redraw.
          return;
        }
        const line = new this.LeaderLineRef(src, tgt, {
          color: '#007bff',
          size: 2,
          path: 'fluid',
          startPlug: 'behind',
          endPlug: 'arrow3',
          startSocket: 'right',
          endSocket: 'left',
          gradient: true,
          middleLabel: this.LeaderLineRef.captionLabel(''),
          dash: { animation: true }
        });

        // style the SVG
        setTimeout(() => {
          document.querySelectorAll('.leader-line').forEach(svg => {
            (svg as HTMLElement).style.zIndex = '99999';
            (svg as HTMLElement).style.pointerEvents = 'none';
          });
        }, 0);

        m.line = line;
      });
    } catch (err) {
      console.warn('LeaderLine creation failed - endpoints might be disconnected', m, err);
      m.line = null;
    }
  }

  /**
   * Redraw all lines: position existing ones; for mappings with line === null attempt to create them.
   * Also ensure we remove lines whose endpoints are disconnected.
   */
  redrawLines() {
    console.log('called');

    this.mappings.forEach(m => {
      try {
        const srcVisible = this.srcVisibility.get(m.sourceId) ?? this.isSourceVisible(m.sourceId, 1);
        const tgtVisible = this.tgtVisibility.get(m.targetId) ?? this.isTargetVisible(m.targetId, 1);
        console.log(srcVisible, tgtVisible);
        if (m.line && srcVisible && tgtVisible) {
          // if endpoints got disconnected since creation, remove the line
          const srcEl = document.getElementById(m.sourceId);
          const tgtEl = document.getElementById(m.targetId);
          if (!this.isElementConnected(srcEl) || !this.isElementConnected(tgtEl)) {
            try { m.line.remove(); } catch (e) { /* ignore */ }
            m.line = null;
          } else {
            // endpoints connected — reposition
            try { m.line.position && m.line.position(); } catch (e) { /* ignore */ }
          }
        } else {
          // attempt to create if endpoints currently present & visible
          const requiredRatio = 1; // or 0.5 if you prefer
          if (this.isSourceVisible(m.sourceId, requiredRatio) && this.isTargetVisible(m.targetId, requiredRatio)) {
            this.safeCreateLineForMapping(m);
          }
        }
      } catch (err) {
        console.warn('redrawLines error for mapping', m, err);
        // if leaderline instance is in a bad state, remove it to be safe
        try { m.line && m.line.remove(); } catch (e) { /* ignore */ }
        m.line = null;
      }
    });
  }

  clearMappings() {
    // remove each leaderline if present, unobserve endpoints, then clear mapping array
    this.mappings.forEach(m => {
      try { m.line && m.line.remove(); } catch (e) { /* ignore */ }
      this.unobserveElementById(m.sourceId);
      this.unobserveElementById(m.targetId);
    });
    this.mappings = [];
  }


  /**
 * Find an existing mapping object by sourceId and targetId
 */
  private findMapping(sourceId: string, targetId: string) {
    return this.mappings.find(m => m.sourceId === sourceId && m.targetId === targetId);
  }

  /**
   * Remove mapping object and its leader line (cleanly)
   */
  private removeMapping(mapping: { sourceId: string; targetId: string; line: any }) {
    if (!mapping) return;
    try {
      if (mapping.line && typeof mapping.line.remove === 'function') mapping.line.remove();
    } catch (e) { console.warn('Error removing leader line', e); }

    // unobserve endpoints
    this.unobserveElementById(mapping.sourceId);
    this.unobserveElementById(mapping.targetId);

    const idx = this.mappings.indexOf(mapping);
    if (idx >= 0) this.mappings.splice(idx, 1);
    // If the removed mapping involved currently selected nodes, clear selection
    const selectedSrcId = this.selectedSourceNode ? `source-${this.selectedSourceNode.key}` : null;
    const selectedTgtId = this.selectedTargetNode ? `target-${this.selectedTargetNode.key}` : null;
    if (selectedSrcId === mapping.sourceId || selectedTgtId === mapping.targetId) {
      this.clearSelections();
    }

    // reposition remaining lines
    setTimeout(() => this.redrawLines(), 0);
  }

  /**
   * Remove mapping(s) where the given node is involved.
   * side: 'source' | 'target' | 'both'
   */
  removeMappingsForNode(node: TreeNode | undefined, side: 'source' | 'target' | 'both' = 'both') {
    if (!node) return;

    const id = (s: 'source' | 'target') => `${s}-${node.key}`;
    const toRemove: typeof this.mappings = [];

    this.mappings.forEach(m => {
      if (side === 'both' && (m.sourceId === id('source') || m.targetId === id('target'))) {
        toRemove.push(m);
      } else if (side === 'source' && m.sourceId === id('source')) {
        toRemove.push(m);
      } else if (side === 'target' && m.targetId === id('target')) {
        toRemove.push(m);
      }
    });

    toRemove.forEach(m => this.removeMapping(m));
    // after removing, redraw remaining lines
    setTimeout(() => this.redrawLines(), 0);
  }

  /**
   * Validates the roleForm.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  createMap(): void {
    if (!this.selectedSourceNode || !this.selectedTargetNode) return;

    const sourceId = `source-${this.selectedSourceNode.key}`;
    const targetId = `target-${this.selectedTargetNode.key}`;

    // debug existing mapping
    console.log('existing mapping', this.mappings);

    // debug attempting map
    console.log('attempting map', { sourceId, targetId, sourceNode: this.selectedSourceNode, targetNode: this.selectedTargetNode });

    // block root->root if desired
    if (sourceId === 'source-0.root' && targetId === 'target-0.Root') {
      console.log('root->root mapping blocked');
      return;
    }

    // prevent self mapping if source and target keys are identical (optional)
    if (this.selectedSourceNode.key === this.selectedTargetNode.key) {
      console.warn('source and target are same node; mapping skipped');
      return;
    }

    //Check if same mapping already exists (toggle off)
    const existing = this.findMapping(sourceId, targetId);

    if (existing) {
      // toggle: remove mapping if already exists
      this.removeMapping(existing);
      // clear UI selection after removing mapping
      this.clearSelections();
      return;
    }

    //Check if this source already mapped to any target
    const existingSourceMapping = this.mappings.find(m => m.sourceId === sourceId);
    if (existingSourceMapping) {
      console.warn('Source already mapped to another target. Removing old mapping...');
      this.removeMapping(existingSourceMapping);
    }

    //Check if this target already mapped to any source
    const existingTargetMapping = this.mappings.find(m => m.targetId === targetId);
    if (existingTargetMapping) {
      console.warn('Target already mapped to another source. Removing old mapping...');
      this.removeMapping(existingTargetMapping);
    }

    // Create a mapping record immediately with line null until we can create it safely
    const mapping = { sourceId, targetId, line: null as any };
    this.mappings.push(mapping);

    // ensure observers and observe endpoints
    this._debouncedRecreateObservers();
    this.observeElementById(mapping.sourceId);
    this.observeElementById(mapping.targetId);

    // Try create now — but safeCreateLineForMapping will check isConnected
    // Use requestAnimationFrame to let Angular finish DOM updates if any
    requestAnimationFrame(() => {
      if (this.isSourceVisible(mapping.sourceId, 1) && this.isTargetVisible(mapping.targetId, 1)) {
        this.safeCreateLineForMapping(mapping);
      }
      this.clearSelections();
    });
  }

  // ---------------------------
  // Selection, UI & tree handlers
  // ---------------------------
  onSelectSource(node: any) {
    this.selectedSourceNode = node;
  }

  onSelectTarget(node: any) {
    this.selectedTargetNode = node;
    console.log(this.selectedSourceNode);
    console.log(this.selectedTargetNode);
    if (this.selectedSourceNode && this.selectedTargetNode) {
      this.createMap(); // auto-connect when both selected
    }
  }

  /**
 * Clear currently selected nodes and refresh the tree bindings so the UI deselects visually.
 */
  private clearSelections() {
    console.log('Node Highlights cleared');
    // clear model
    this.selectedSourceNode = undefined;
    this.selectedTargetNode = undefined;

    // force change detection for p-tree by replacing the arrays (safe)
    this.sourceTree = [...this.sourceTree];
    this.targetTree = [...this.targetTree];

    // small timeout to ensure DOM updates (optional)
    setTimeout(() => {
      this.redrawLines();
      this.cdRef.markForCheck();
    }, 50);
  }




  // ---------------------------
  // Node expand / collapse -> hide / show connected mappings
  // ---------------------------
  /**
 * Called when any tree node is expanded
 * event.node is the expanded TreeNode
 */
  onNodeExpand(event: any) {
    const node = event.node;
    if (!node) return;
    // show mappings that were hidden due to ancestor being collapsed
    // after expand, roots might change; reattach and re-observe
    this._debouncedRecreateObservers();
    this.updateMappingsVisibilityForNode(node, true);
  }

  /**
   * Called when any tree node is collapsed
   * event.node is the collapsed TreeNode
   */
  onNodeCollapse(event: any) {
    const node = event.node;
    if (!node) return;

    // hide mappings that connect to/from this node or its descendants
    this.updateMappingsVisibilityForNode(node, false);
    // after expand, roots might change; reattach and re-observe
    this._debouncedRecreateObservers();
  }

  /**
   * Show/hide all mappings that are connected to the given node or its descendants.
   * visible = true -> try to show mappings (only when both DOM endpoints exist)
   * visible = false -> hide matching mappings immediately
   */
  private updateMappingsVisibilityForNode(node: TreeNode, visible: boolean) {
    if (!node || !node.key) return;

    const prefix = node.key; // e.g. "root.place"
    // For each mapping check if either endpoint is within this collapsed/expanded subtree
    this.mappings.forEach(m => {
      const srcPath = this.extractPathFromId(m.sourceId); // returns 'root.place.temp'
      const tgtPath = this.extractPathFromId(m.targetId);

      const affected =
        this.isAncestorPrefix(prefix, srcPath) ||
        this.isAncestorPrefix(prefix, tgtPath);

      if (!affected) return;

      try {
        if (!visible) {
          // Collapse -> hide mapping
          // hide/remove line
          if (m.line && typeof m.line.hide === 'function') {
            try { m.line.hide(); } catch (e) { /* ignore */ }
          } else if (m.line) {
            try { m.line.remove(); } catch (e) { /* ignore */ }
          }
          // keep m.line = null to indicate "no active leaderline"
          m.line = null;
        } else {
          // on expand: attempt to (re)create if endpoints exist
          if (this.isSourceVisible(m.sourceId, 1) && this.isTargetVisible(m.targetId, 1)) {
            this.safeCreateLineForMapping(m);
          }
          if (m.line && typeof m.line.position === 'function') m.line.position();
        }
      } catch (err) {
        console.warn('Error updating mapping visibility for', m, err);
      }
    });
  }

  private hideAllMappings() {
    this.mappings.forEach(m => m.line?.hide?.());
  }

  private showAllMappings() {
    this.mappings.forEach(m => {
      if (m.line) m.line.show?.();
      else {
        if (this.isSourceVisible(m.sourceId, 1) && this.isTargetVisible(m.targetId, 1)) {
          this.safeCreateLineForMapping(m);
        }
      }
    });
    this.redrawLines();
  }


  /** Utility: check if ancestorPath is prefix of childPath */
  private isAncestorPrefix(ancestorPath: string, childPath?: string | null) {
    if (!ancestorPath || !childPath) return false;
    if (ancestorPath === childPath) return true;
    return childPath.startsWith(ancestorPath + '.');
  }

  /** Utility: extract logical path from element id of form "source-root.place.temp" or "target-..." */
  private extractPathFromId(id: string): string | null {
    if (!id) return null;
    const parts = id.split('-');
    // id format is "source-root.place.temp" or "target-root.place.temp"
    if (parts.length < 2) return null;
    // remove the first prefix "source" / "target" and rejoin the rest
    return parts.slice(1).join('-'); // note: your keys don't contain '-' so this is safe
  }



  /**
   * Parse XML string to JSON-like object
   */
  private parseXmlToObject(xmlString: string): any {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        console.error('XML parsing error:', parseError.textContent);
        return null;
      }

      const convertNode = (node: Node): any => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          return text ? text : null;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const result: any = {};
          
          // Process child nodes
          const children: any[] = [];
          let hasTextContent = false;
          
          for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent?.trim();
              if (text) {
                hasTextContent = true;
                result._text = text;
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const childElement = child as Element;
              const childName = childElement.tagName;
              const childValue = convertNode(childElement);
              
              if (childValue !== null) {
                if (result[childName]) {
                  // Multiple elements with same name - convert to array
                  if (!Array.isArray(result[childName])) {
                    result[childName] = [result[childName]];
                  }
                  result[childName].push(childValue);
                } else {
                  result[childName] = childValue;
                }
              }
            }
          }

          // If no children or only text, return the value
          if (Object.keys(result).length === 0) {
            return null;
          }
          
          // If only _text, return just the text value
          if (Object.keys(result).length === 1 && result._text) {
            return result._text;
          }
          
          // Remove _text if there are other properties
          if (Object.keys(result).length > 1 && result._text) {
            delete result._text;
          }
          
          return result;
        }
        
        return null;
      };

      const rootElement = xmlDoc.documentElement;
      const converted = convertNode(rootElement);
      
      // Wrap in array format for buildTreeFromArray
      return Array.isArray(converted) ? converted : [converted];
    } catch (error) {
      console.error('Error parsing XML:', error);
      return null;
    }
  }

  /**
   * Check if a string is XML
   */
  private isXmlString(str: string): boolean {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    return trimmed.startsWith('<') && trimmed.endsWith('>');
  }

  /**
 * Patches the web service data to the appForm
 * @param {any} wsResData - web service data (can be JSON object, JSON string, or XML string)
 * @returns {void} - returns nothing (i.e) void
 */
  patchValue(wsResData: any): void {
    let formattedData: string = '';
    let parsedData: any = null;

    // Handle different response types
    if (typeof wsResData === 'string') {
      // Check if it's XML
      if (this.isXmlString(wsResData)) {
        this.responseType = 'xml';
        formattedData = wsResData;
        // Parse XML to object for tree building
        parsedData = this.parseXmlToObject(wsResData);
      } else {
        this.responseType = 'json';
        // Try to parse as JSON
        try {
          parsedData = JSON.parse(wsResData);
          formattedData = JSON.stringify(parsedData, null, 2);
        } catch (e) {
          // If not valid JSON, treat as plain string
          formattedData = wsResData;
          parsedData = wsResData;
        }
      }
    } else if (typeof wsResData === 'object' && wsResData !== null) {
      this.responseType = 'json';
      // Already an object (JSON)
      formattedData = JSON.stringify(wsResData, null, 2);
      parsedData = wsResData;
    } else {
      this.responseType = 'json';
      formattedData = String(wsResData || '');
      parsedData = wsResData;
    }
    
    // Update editor language based on response type
    this.responseOptions = { 
      ...this.baseEditorOptions, 
      language: this.responseType,
      readOnly: true 
    };

    this.wsResForm.patchValue({
      wsResponse: formattedData
    });

    this.wsResponse = formattedData;
    
    // Store parsed data for use in buildSaveObject
    // For XML: parsedData is already an array from parseXmlToObject
    // For JSON: parsedData is the parsed object
    this.parsedResponseData = parsedData;

    // Convert to tree structure
    // For XML, parsedData will be an array from parseXmlToObject
    // For JSON, ensure it's an array
    let dataArray: any[] = [];
    if (Array.isArray(parsedData)) {
      dataArray = parsedData;
    } else if (parsedData && typeof parsedData === 'object') {
      dataArray = [parsedData];
    }

    // Build tree from data
    if (dataArray.length > 0) {
      this.sourceTree = this.jsonTreeBuilderService.buildTreeFromArray(dataArray);
    } else {
      this.sourceTree = [];
    }

    this.assignUniqueKeys(this.sourceTree);

    // empty internal (user-defined) tree
    this.targetTree = [];

    this.assignUniqueKeys(this.targetTree);
  }


  /**
 * Add child node to selected target node
 */
  addChildNode() {
    // if (!this.selectedTargetNode) return;
    // if (!this.selectedTargetNode.children) this.selectedTargetNode.children = [];
    this.hideAllMappings();

    // Open dialog
    this.ref = this.dialog.open(ManageAttributeComponent, {
      header: 'Choose Attribute',
      modal: true,
      closable: true,
      data: { mode: 'create' },
      width: getResponsiveDialogWidth(),
    });

    this.ref.onClose.subscribe((res: any) => {
      // If user selected/entered attribute data
      if (res?.status && res?.data?.attributeName) {
        const label = res.data.attributeName;
        const uniqueSuffix =
          Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        const newKey = `${label}_${uniqueSuffix}`;

        const newNode: TreeNode = {
          label,
          key: newKey,
          data: {
            type: 'string',
            path: newKey,
            attributeDetails: res.data,
          },
          children: [],
        };

        //If no targetNode selected → add as root node
        if (!this.selectedTargetNode) {
          this.targetTree.push(newNode);
        } else {
          //If a node is selected → add as its child
          if (!this.selectedTargetNode.children)
            this.selectedTargetNode.children = [];
          this.selectedTargetNode.children.push(newNode);
        }

        // Refresh tree view and redraw lines
        this.targetTree = [...this.targetTree];
        // Show mappings again after dialog close
        setTimeout(() => this.showAllMappings(), 0);
      }

      // If user closed without attribute
      else {
        setTimeout(() => this.showAllMappings(), 0);
      }
    });
  }


  /**
   * Rename selected node
   */
  renameNode() {
    if (!this.selectedTargetNode) return;

    // Set the node currently being edited
    this.editingNode = this.selectedTargetNode;
    this.editingLabel = this.selectedTargetNode.label;
  }

  saveRename(node: any) {
    if (this.editingLabel && this.editingLabel.trim()) {
      node.label = this.editingLabel.trim();
      this.targetTree = [...this.targetTree];

      setTimeout(() => this.redrawLines(), 0);
    }
    this.editingNode = null;
  }

  cancelRename() {
    this.editingNode = null;
  }


  /**
   * Delete selected node
   */
  deleteNode() {
    if (!this.selectedTargetNode) return;
    const confirmDelete = confirm(`Delete "${this.selectedTargetNode.label}"?`);
    if (!confirmDelete) return;

    // remove any mappings associated with node
    const targetId = `target-${this.selectedTargetNode.key}`;
    const toRemove = this.mappings.filter(m => m.targetId === targetId);
    toRemove.forEach(m => this.removeMapping(m));

    const removeRecursive = (nodes: TreeNode[]) => {
      const index = nodes.indexOf(this.selectedTargetNode!);
      if (index >= 0) nodes.splice(index, 1);
      else nodes.forEach(n => n.children && removeRecursive(n.children));
    };

    removeRecursive(this.targetTree);
    this.targetTree = [...this.targetTree];

    // clear UI selections & redraw
    this.clearSelections();
    setTimeout(() => this.redrawLines(), 0);
  }


  viewResponse() {

  }


  /* -----------------------------
    Helpers: label / attr flattening
    ----------------------------- */

  /**
   * Flatten tree labels into hierarchical label paths, but skip adding a top-level 'root' label
   * Example: ["root", "root.place", "root.temperature"] -> we will return ["root.place","root.temperature"]
   * (we keep the hierarchical form but 'root' alone is omitted)
   */
  private flattenTreeLabels(nodes: TreeNode[] = []): string[] {
    const out: string[] = [];
    const walk = (arr: TreeNode[] | undefined, parentPath = '') => {
      if (!arr) return;
      for (const n of arr) {
        const label = (n.label ?? '').toString();
        const fullLabel = parentPath ? `${parentPath}.${label}` : label;
        // skip a lone 'root' label entry
        if (!(fullLabel === 'root')) {
          out.push(fullLabel);
        }
        if (n.children && n.children.length) walk(n.children, fullLabel);
      }
    };
    walk(nodes);
    // If you want to also remove any leading 'root.' from all items (so results are 'place' instead of 'root.place'),
    // do map(x => x.replace(/^root\./,''))
    return out.map(l => l.replace(/^root\./, '')); // strip leading 'root.' here as per your request
  }

  /**
   * Build a map of key -> attributeDetails for target tree nodes.
   * attributeDetails expected at node.data.attributeDetails (based on your sample)
   */
  private flattenKeyToAttrMap(nodes: TreeNode[] = []): Record<string, any> {
    const map: Record<string, any> = {};
    const walk = (arr: TreeNode[] | undefined, parentPath = '') => {
      if (!arr) return;
      for (const n of arr) {
        const key = n.key;
        const label = (n.label ?? '').toString();
        const fullLabel = parentPath ? `${parentPath}.${label}` : label;
        if (key) {
          // store the attributeDetails object (or null if missing)
          map[key] = (n.data && (n.data as any).attributeDetails) ? (n.data as any).attributeDetails : null;
        }
        if (n.children && n.children.length) walk(n.children, fullLabel);
      }
    };
    walk(nodes);
    return map;
  }

  /**
 * Build a map of each node.key → its label path (like "root.place.temperature")
 * Useful to translate internal keys to readable label names.
 */
  private flattenKeyToLabelMap(nodes: TreeNode[] = []): Record<string, string> {
    const map: Record<string, string> = {};

    const walk = (arr: TreeNode[] | undefined, parentPath = '') => {
      if (!arr) return;
      for (const n of arr) {
        const key = n.key;
        const label = (n.label ?? '').toString();
        const fullLabel = parentPath ? `${parentPath}.${label}` : label;
        if (key) map[key] = fullLabel;
        if (n.children && n.children.length) walk(n.children, fullLabel);
      }
    };

    walk(nodes);
    return map;
  }


  /* -----------------------------
     Utility: get value by dot-path from an object
     e.g. getValueByPath(item, 'place') => item['place']
           getValueByPath(item, 'a.b.c') => safely returns nested value or undefined
     ----------------------------- */
  private getValueByPath(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      // if property is numeric index in array, handle that too
      const idx = /^\d+$/.test(p) ? parseInt(p, 10) : p;
      cur = cur[idx];
    }
    return cur;
  }

  /* -----------------------------
     Updated buildSaveObject() that:
     - strips "root" from externalField
     - builds mappedField: { "<src-name>": <attributeDetails-object> }
     - builds mongoCollection: [ { "<targetLabel>": <value-from-external> }, ... ]
     - handles both JSON and XML responses
     ----------------------------- */
  private buildSaveObject() {
    // 1) externalData - use parsed data if available, otherwise try to parse from string
    let externalData: any = {};
    
    if (this.parsedResponseData !== null && this.parsedResponseData !== undefined) {
      // Use the stored parsed data (works for both JSON and XML)
      externalData = this.parsedResponseData;
    } else if (this.wsResponse) {
      // Fallback: try to parse from string
      try {
        if (this.responseType === 'xml') {
          // If XML, parse it again
          externalData = this.parseXmlToObject(this.wsResponse);
        } else {
          // If JSON, parse the string
          externalData = JSON.parse(this.wsResponse);
        }
      } catch (e) {
        console.warn('Error parsing response data in buildSaveObject:', e);
        externalData = {};
      }
    }
    
    // Normalize externalData to array format for processing
    // This is needed for building mongoCollection and counting
    let externalDataArray: any[] = [];
    if (Array.isArray(externalData)) {
      externalDataArray = externalData;
    } else if (externalData && typeof externalData === 'object') {
      externalDataArray = [externalData];
    }

    // 2) externalDataCount
    const externalDataCount = externalDataArray.length;
    
    // 3) For save, we want to store the original response format
    // If it was XML, store as XML string; if JSON, store as parsed object/array
    let externalDataForSave: any;
    if (this.responseType === 'xml') {
      // Store original XML string
      externalDataForSave = this.wsResponse || '';
    } else {
      // For JSON, store the parsed data (keep original structure)
      // If parsedData was originally an array, keep it as array
      // If it was an object, keep it as object
      if (this.parsedResponseData !== null && this.parsedResponseData !== undefined) {
        externalDataForSave = this.parsedResponseData;
      } else {
        // Fallback: use the array format we created
        externalDataForSave = externalDataArray.length === 1 ? externalDataArray[0] : externalDataArray;
      }
    }

    // 4) externalField & internalField (labels). externalField strips "root" prefix.
    // flattenTreeLabels already strips 'root.' from the returned labels
    const externalField = this.flattenTreeLabels(this.sourceTree); // e.g. ["place","temperature"]
    const internalField = this.flattenTreeLabels(this.targetTree); // e.g. ["Name"]

    // 5) maps for translating keys -> labels / attributeDetails
    const srcKeyToLabel = this.flattenKeyToLabelMap ? this.flattenKeyToLabelMap(this.sourceTree) : {}; // if you still have key->label map function
    const tgtKeyToAttr = this.flattenKeyToAttrMap(this.targetTree); // key -> attributeDetails

    // 6) Build mappedField where key is source field WITHOUT root prefix (e.g. "place")
    //    and value is the target attributeDetails object (from target tree)
    const mappedField: Record<string, any> = {};
    // Also build an aux map to know which source path maps to which target label for mongo mapping
    const srcPathToTargetLabel: Record<string, string> = {}; // e.g. { "place": "Name" }

    this.mappings.forEach(m => {
      try {
        // m.sourceId => 'source-<key>', m.targetId => 'target-<key>'
        const srcKey = (m.sourceId || '').replace(/^source-/, '');
        const tgtKey = (m.targetId || '').replace(/^target-/, '');

        // source label path (if you have a key->label map). If you don't have flattenKeyToLabelMap,
        // fallback to extracting path from id, then stripping leading 'root.'
        let srcLabelPath = srcKeyToLabel[srcKey] ?? this.extractPathFromId(m.sourceId) ?? srcKey;
        srcLabelPath = srcLabelPath.replace(/^root\./, ''); // ensure root. stripped

        // target label (human): use key->label map if available else fallback to node label lookup
        const tgtAttr = tgtKeyToAttr[tgtKey] ?? null;

        // target human label: try to find label string from your targetTree keys (we can search)
        let tgtLabel = '';
        try {
          // attempt to get label from the selectedTargetNode if present
          // otherwise derive from target tree by searching node.key === tgtKey
          const findLabel = (nodes: TreeNode[] = []): string | null => {
            for (const n of nodes) {
              if (n.key === tgtKey) return n.label?.toString() ?? null;
              if (n.children && n.children.length) {
                const r = findLabel(n.children);
                if (r) return r;
              }
            }
            return null;
          };
          const found = findLabel(this.targetTree);
          tgtLabel = found ?? (tgtAttr && tgtAttr.attributeName) ?? tgtKey;
        } catch (e) {
          tgtLabel = (tgtAttr && tgtAttr.attributeName) ?? tgtKey;
        }

        if (srcLabelPath) {
          mappedField[srcLabelPath] = tgtAttr; // attributeDetails object (may be null)
          srcPathToTargetLabel[srcLabelPath] = tgtLabel;
        }
      } catch (e) {
        // ignore bad mapping
      }
    });

    // 7) Build mongoCollection array from externalDataArray.
    // For each object in externalDataArray, build a new object with keys as target labels and values pulled from the source path.
    const mongoCollection: any[] = [];
    if (externalDataArray.length > 0) {
      for (const item of externalDataArray) {
        const doc: Record<string, any> = {};
        // for each mapped srcPath -> targetLabel
        Object.keys(srcPathToTargetLabel).forEach(srcPath => {
          // srcPath is like "place" or "address.city" (no root)
          const targetLabel = srcPathToTargetLabel[srcPath];
          const value = this.getValueByPath(item, srcPath);
          // if value is undefined we may skip or set null; choose as you prefer. We'll set value if defined.
          doc[targetLabel] = value !== undefined ? value : null;
        });
        // push only if doc has at least one non-null/non-undefined mapping (optional)
        mongoCollection.push(doc);
      }
    }

    // 8) Deep-clean trees and mappings before returning (to remove circular refs)
    const cleanTree = (tree: TreeNode[]): any[] => {
      return tree.map(node => ({
        key: node.key,
        label: node.label,
        data: node.data ?? null,
        type: node.type ?? null,
        children: node.children ? cleanTree(node.children) : []
      }));
    };

    const cleanMappings = this.mappings.map(m => ({
      sourceId: m.sourceId,
      targetId: m.targetId
      // exclude m.line (LeaderLine instance)
    }));


    // final payload
    return {
      externalData: externalDataForSave ?? (this.responseType === 'xml' ? '' : {}),
      externalDataCount,
      externalField,   // labels with root stripped, e.g. ["place","temperature"]
      internalField,   // labels for internal (target) tree, e.g. ["Name"]
      mappedField,     // { "place": { attributeDetails... } }
      isTimeStamp: 'no',
      mongoCollection,  // e.g. [ { "Name": "Chennai" }, { "Name": "Bangalore" }, ... ]
      mappings: cleanMappings,
      sourceTree: cleanTree(this.sourceTree),
      targetTree: cleanTree(this.targetTree),
      responseType: this.responseType  // Store response type for future reference
    };
  }

  /* -----------------------------
       onSave updated to close with payload
       ----------------------------- */
  onSave() {
    const result = this.buildSaveObject();
    console.log('Final save payload:', result);

    const id = this.wsResForm.getRawValue()._id;
    console.log(id);

    console.log(this.mappings);

    this.webserviceAdministrationService.putWS(result, id)
      .pipe(map((res: any) => res || []))
      .subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          this.showToast('success', 'Success', 'Successfully updated mapping', 3000, false);
          this.ref.close({ status: true, payload: response });
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.showToast('error', 'Error', 'Failed to update web service', 3000, false);
        }
      });
  }



  onCancel() {
    this.targetTree = [];
    this.clearMappings();
    this.ref.close({ status: false });
  }
}
