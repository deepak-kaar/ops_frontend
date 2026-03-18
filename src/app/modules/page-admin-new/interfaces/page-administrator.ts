export interface Apps {
    appId: string
    appName: string
}

export interface Orgs {
    orgId: string
    orgName: string
}

export interface ReportTypes {
    name: string,
    type: string
}

export interface CanvasType {
    name: string;
    width?: string;
    height?: string;
}

export interface Assignment {
    id: string,
    name: string,
    description: string
}

export interface Assignment {
    id: string,
    name: string,
    description: string
}
interface item {
    type: string;
    label: string;
    icon: string;
}

export interface Widget {
    items?: item[];
    value:string,
    category?: string;
}

export interface Template {
    templateName: string;
    templateData: any;
}

export interface fontFamily {
    label: string,
    value: string
}

export interface fontWeight {
    label: string,
    value: string
}

export interface fontFamily {
    label: string,
    value: string
}

export interface justifyOption {
    icon: string,
    justify: string
}

export interface fontWeight {
    label: string,
    value: string
  }
  
  export interface fontFamily {
    label: string,
    value: string
  }
  
  export interface justifyOption {
    icon: string,
    justify: string
  }