export const API_ENDPOINTS = {
    DATAPOINT_ADMIN: {
        ENTITY: {
            GET_LIST: 'entity/getEntity',
            CREATE: 'entity/createEntity',
            UPDATE: 'entity/updateEntity',
            DELETE: 'entity/deleteEntity/',
            GET_DETAILS: 'entity/getEntity/',
            GET_ATTRIBUTES: 'entity/getAttributes',
            GET_ENTITY_DETAILS: 'entity/getEntityDetails/',
            GET_LOGS: 'entity/getLogs'
        },
        INSTANCE: {
            GET_LIST: 'instance/getInstance/',
            CREATE: 'instance/createInstance',
            UPDATE: 'instance/updateInstance',
            DELETE: 'instance/deleteInstance/'
        },
        FLAGS: {
            GET_LIST: 'flag/getFlag/',
            CREATE: 'flag/postFlag',
            UPDATE: 'flag/updateFlag',
            DELETE: 'flag/deleteFlag/'
        },
        EVENTS: {
            GET_LIST: 'event/getEvent/',
            CREATE: 'event/postEvent',
            GET_EVENT: 'event/getEvent/',
            UPDATE_EVENT:'event/updateEvent',
            DELETE_EVENT: 'event/deleteEvent/'
        },
        ATTRIBUTES: {
            GET_FILTERED: 'attribute/getFilteredAttributes',
            SSE: 'attribute/getAttributeSSE/'
        },
        NOTIFICATIONS: {
            CREATE: 'notification/postNotification',
            GET: 'notification/getNotifications/',
            UPDATE: 'notification/updateNotification',
            DELETE: 'notification/deleteNotification/'
        },
    },
    ORG_ADMIN: {
        ROLES: {
            GET_LIST: 'roles/getRoles',
            GET_FILTERED_ROLES: 'roles/getFilteredRoles'
        },
        APPS: {
            FREQS: {
                GET_LIST: 'app/freq/getFreq/',
                CREATE: 'app/freq/createFreq',
                UPDATE: 'app/freq/updateFreq',
                DELETE: 'app/freq/deleteFreq/'
            }
        },
        LOGS: {
            CREATE: 'logger/postLog/'
        }
    },
    CALCULATION_ENGINE: {
        TEMPLATE: {

        },
        MAPPING: {
            GET_LIST: 'calc/getNewCalcuMapping'
        },
        EXCUETION: {
            RUN: 'calc/calculateEngine'
        }
    },

    CORRELATION_ENGINE: {
        TEMPLATE: {
            GET_LIST: 'calc/getCorrelationList',
            CREATE: 'calc/postCorrelation'
        },
        MAPPING: {
            GET_LIST: 'calc/getNewCalcuMapping'
        },
        EXCUETION: {
            RUN: 'calc/calculateEngine',
            PREVIEW: 'calc/previewCorrelationStages'
        },
    },
    ACTIVITY_ENGINE: {
        FUNCTION_MODELS: {
            GET_LIST: 'activity/getActivityFM',
            GET_FM: 'activity/getActivityFMById/',
            CREATE_FM: 'activity/postActivityFM'
        },
        STEPS: {
            GET_LIST: 'activity/getActivitySteps',
            CREATE_STEP: 'activity/postActivitySteps'
        },
        TEMPLATE: {
            GET_LIST: 'activity/getActivityTemplate',
            CREATE: 'activity/postActivityTemplate'
        },
        INSTANCES: {
            GET_LIST: 'activity/getActivityInstance',
            CREATE: 'activity/postActivityInstance',
            GET_QUEUE: "activity/getActivityQueueSSE/"
        },
        EXCUETION: {
            RUN: 'activity/runActivityInstance',
            PREVIEW: 'activity/previewActivityInstance'
        },
    },
    PAGE_ADMIN: {
        CREATE_PAGE: 'idt/postIdt',
        GET_TEMPLATES: 'idt/getTemplates',
        GET_TEMPLATE: 'idt/getTemplate/',
        GET_TEMPLATE_MAPPINGS: 'idt/getTemplateMappings',
        GET_TEMPLATE_MAPPING: 'idt/getTemplateMapping',
        POST_TEMPLATE_MAPPING: 'idt/createTemplateMapping',
        DELETE_TEMPLATE_MAPPING: 'idt/deleteTemplateMapping/'
    },
    GLOBAL_RENDERER: {
        GET_MAPPING: 'idt/getTemplateMappings',
        GET_TEMPLATES: 'idt/getTemplates'
    },
    LANDING_PAGE: {
        GET_ONGOING_CARDS: 'idt/getCards'
    },
    LLM: {
        prompt: 'llm/postPrompt',
        prompt1: 'llm/postPrompt1',
        queryPrompt: 'proxy/chat-db'
    },
    REPORT_RENDERER: {
        generateReport: 'pdf/generatePDFFromHtml',
        storeReport: 'pdf/storePDFReport',
        getReportHistory: 'pdf/getPdfReports',
        mailReport: 'pdf/sendPdfAsMail' 
    }
};