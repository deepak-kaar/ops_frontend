import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Category {
    _id: string;
    categoryId: string;
    categoryName: string;
    categoryDescription: string;
    isActive: boolean;
    orgId?: string;
    appId?: string;
    roles?: Role[];
    // Attributes mapped to this category
    createdOn?: Date;
    updatedOn?: Date;
    attributeMappings?: any[];
    frozenRoles?: string[];
    accessLevel?: number;
    accessRoleId?: string;
    // convenience flag for current role (set by backend)
    isFrozenForRole?: boolean;
}

export interface Role {
    _id?: string;
    roleId: string;
    roleName: string;
    roleDescription?: string;
    ischeck?: boolean;
    hierarchyLevel?: number;
    defaultAccessLevel?: number;
}

export interface CategoryResponse {
    token: string;
    categories: Category[];
    userAccessLevel?: number;
}

export interface App {
    appId: string;
    appName: string;
}

export interface AppResponse {
    apps: App[];
}

@Injectable({
    providedIn: 'root'
})
export class LockScreenService {
    private baseUrl: string = environment.apiUrl;
    private lockScreenUrl: string = this.baseUrl + 'lockScreen';
    private getAppsUrl: string = this.baseUrl + 'app/getApp';
    private getRolesUrl: string = this.baseUrl + 'roles/getRoles/';

    constructor(private http: HttpClient) { }

    /**
     * Fetches the list of apps for dropdown.
     */
    getApps(): Observable<AppResponse> {
        return this.http.get<AppResponse>(this.getAppsUrl).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Fetches the list of roles for a given application.
     * @param appId - The application ID
     * @returns Observable containing the roles array
     */
    getRolesByApp(appId: string): Observable<{ roles: Role[] }> {
        const payload = {
            roleLevelId: appId,
            roleLevel: 'Application'
        };
        return this.http.post<{ roles: Role[] }>(this.getRolesUrl, payload).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Creates a new category.
     */
    createCategory(payload: { categoryName: string; categoryDescription?: string; isActive?: boolean; orgId?: string; appId?: string }): Observable<any> {
        return this.http.post(this.lockScreenUrl + '/createCategory', payload).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Fetches all categories.
     */
    getCategories(orgId?: string, appId?: string): Observable<CategoryResponse> {
        let url = this.lockScreenUrl + '/getCategories';
        const params: string[] = [];
        if (orgId) params.push(`orgId=${orgId}`);
        if (appId) params.push(`appId=${appId}`);
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        return this.http.get<CategoryResponse>(url).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Fetches categories filtered by user roles (for approval screen / MDE).
     * @param payload - Contains orgId, appId and userRoles from localStorage
     */
    getCategoriesByRole(payload: { orgId?: string; appId?: string; userRoles: string[]; userId?: string }): Observable<CategoryResponse> {
        return this.http.post<CategoryResponse>(this.lockScreenUrl + '/getCategoriesByRole', payload).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Updates freeze/unfreeze state for categories for a specific role.
     * @param payload - { appId, orgId, roleName, categoryIds }
     */
    updateFreezeForRole(payload: { appId?: string; orgId?: string; roleName: string; roleId?: string; userId?: string; categoryIds: string[] }): Observable<CategoryResponse> {
        return this.http.post<CategoryResponse>(this.lockScreenUrl + '/updateFreezeForRole', payload).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Fetches a category by ID.
     */
    getCategoryById(id: string): Observable<any> {
        return this.http.get(this.lockScreenUrl + '/getCategory/' + id).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Updates a category.
     */
    updateCategory(id: string, payload: { categoryName: string; categoryDescription?: string; isActive?: boolean; roles?: Role[] }): Observable<any> {
        return this.http.post(this.lockScreenUrl + '/updateCategory/' + id, payload).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Deletes a category.
     */
    deleteCategory(id: string): Observable<any> {
        return this.http.delete(this.lockScreenUrl + '/deleteCategory/' + id).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Fetches template mappings for attribute mapping.
     */
    getTemplateMappings(payload: { appId?: string; orgId?: string; templateType?: string }): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'idt/getTemplateMappings', payload).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Fetches a single template mapping payload by mappingId.
     * Uses same endpoint strategy as global-renderer.
     */
    getTemplateMapping(payload: { mappingId: string; date?: string }): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'idt/getTemplateMapping', payload).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /**
     * Maps attributes to a category.
     */
    mapAttributesToCategory(categoryId: string, attributeMappings: any[]): Observable<any> {
        return this.http.post(this.lockScreenUrl + '/mapAttributesToCategory/' + categoryId, { attributeMappings }).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => {
                throw err;
            })
        );
    }

    /** Fetches attributes for mapping (used in map-attribute dropdown). */
    getAttributesForMapping(appId?: string, orgId?: string): Observable<any> {
        let url = this.baseUrl + 'attribute/getAttributesForMapping';
        const params: string[] = [];
        if (appId) params.push('appId=' + encodeURIComponent(appId));
        if (orgId) params.push('orgId=' + encodeURIComponent(orgId));
        if (params.length > 0) url += '?' + params.join('&');
        return this.http.get(url).pipe(
            map((res: any) => res),
            timeout(20000),
            catchError((err) => { throw err; })
        );
    }
}
