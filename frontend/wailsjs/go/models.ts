export namespace main {
	
	export class AuthConfig {
	    type: string;
	    basicUsername?: string;
	    basicPassword?: string;
	    bearerToken?: string;
	    bearerPrefix?: string;
	    apiKeyKey?: string;
	    apiKeyValue?: string;
	    apiKeyLocation?: string;
	
	    static createFrom(source: any = {}) {
	        return new AuthConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.basicUsername = source["basicUsername"];
	        this.basicPassword = source["basicPassword"];
	        this.bearerToken = source["bearerToken"];
	        this.bearerPrefix = source["bearerPrefix"];
	        this.apiKeyKey = source["apiKeyKey"];
	        this.apiKeyValue = source["apiKeyValue"];
	        this.apiKeyLocation = source["apiKeyLocation"];
	    }
	}
	export class KeyValuePair {
	    key: string;
	    value: string;
	    enabled: boolean;
	
	    static createFrom(source: any = {}) {
	        return new KeyValuePair(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	        this.enabled = source["enabled"];
	    }
	}
	export class RequestData {
	    method: string;
	    url: string;
	    headers: KeyValuePair[];
	    params: KeyValuePair[];
	    body: string;
	    auth?: AuthConfig;
	
	    static createFrom(source: any = {}) {
	        return new RequestData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.method = source["method"];
	        this.url = source["url"];
	        this.headers = this.convertValues(source["headers"], KeyValuePair);
	        this.params = this.convertValues(source["params"], KeyValuePair);
	        this.body = source["body"];
	        this.auth = this.convertValues(source["auth"], AuthConfig);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CollectionItem {
	    id: string;
	    name: string;
	    type: string;
	    children?: CollectionItem[];
	    request?: RequestData;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new CollectionItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.children = this.convertValues(source["children"], CollectionItem);
	        this.request = this.convertValues(source["request"], RequestData);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CollectionWithPath {
	    id: string;
	    name: string;
	    items: CollectionItem[];
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	    filePath: string;
	
	    static createFrom(source: any = {}) {
	        return new CollectionWithPath(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.items = this.convertValues(source["items"], CollectionItem);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	        this.filePath = source["filePath"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

