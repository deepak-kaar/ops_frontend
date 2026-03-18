import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-view-home',
  standalone: false,
  templateUrl: './view-home.component.html',
  styleUrl: './view-home.component.css'
})

export class ViewHomeComponent implements OnInit, OnDestroy {
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  private socket!: Socket;
  private pc!: RTCPeerConnection;
  private broadcasterId: string | null = null;


  backendUrl = environment.apiUrl.replace(/\/$/, '');
  streams: any[] = [];
  selectedStreamId: string | null = null;
  videoUrl: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;
 

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;
  /**
  * @property {boolean} isSidebarOpen - Indicates whether the sidebar menu is currently open or closed.
  */
  isSidebarOpen: boolean = false;

  /**
   * @property {boolean} mobileSidebarVisible - Determines whether the sidebar is visible on mobile devices.
    */
  mobileSidebarVisible = false;

  recordedVideoUrl: string = '';

  constructor( private responsive: ResponsiveService, private http: HttpClient){}

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.loadStreams();

    // ✅ Connect to signaling server using API URL
    this.socket = io(environment.apiUrl, {
      transports: ['websocket']
    });

    // Create PeerConnection
    this.pc = new RTCPeerConnection();

    // Handle incoming media tracks from broadcaster
    this.pc.ontrack = (event) => {
      console.log('📺 Remote stream received');
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
    };

    // Send our ICE candidates to broadcaster
    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.broadcasterId) {
        this.socket.emit('candidate', this.broadcasterId, event.candidate);
      }
    };

    // Wait until a broadcaster appears before joining
    this.socket.on('broadcaster', () => {
      console.log('🎬 Broadcaster available, joining as viewer');
      this.socket.emit('viewer');
    });

    // Handle incoming offer from broadcaster
    this.socket.on('offer', async (id: string, description: RTCSessionDescriptionInit) => {
      console.log('📡 Offer received from broadcaster:', id);

      this.broadcasterId = id;
      await this.pc.setRemoteDescription(description);

      // Create and send answer
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.socket.emit('answer', id, answer);
    });

    // Handle ICE candidate from broadcaster
    this.socket.on('candidate', async (id: string, candidate: RTCIceCandidateInit) => {
      if (this.pc && candidate) {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }

  toggleMobileSidebar() {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  loadStreams() {
    this.isLoading = true;
    this.http.get<any>(`${this.backendUrl}/api/streams`).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.streams = res.streams;
        } else {
          this.errorMessage = 'No streams found.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load streams.';
        console.error(err);
      }
    });
  }

  selectStream(streamId: string) {
    this.selectedStreamId = streamId;
    this.videoUrl = `${this.backendUrl}/api/stream/full/${streamId}`;
    console.log('🎬 Selected stream:', this.videoUrl);
  }

  
   
  
  

  ngOnDestroy(): void {
    // Cleanup
    if (this.pc) this.pc.close();
    if (this.socket) this.socket.disconnect();
  }
}
