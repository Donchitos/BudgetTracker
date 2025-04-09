// Basic Cypress TypeScript definitions

declare namespace Cypress {
  interface Chainable<Subject = any> {
    // Core functions
    visit(url: string, options?: Partial<VisitOptions>): Chainable<Window>;
    get(selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
    contains(content: string | number | RegExp, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
    contains(selector: string, content: string | number | RegExp, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
    within(fn: (currentSubject: JQuery<HTMLElement>) => void): Chainable<JQuery<HTMLElement>>;
    
    // Actions
    click(options?: Partial<ClickOptions>): Chainable<Subject>;
    dblclick(options?: Partial<ClickOptions>): Chainable<Subject>;
    rightclick(options?: Partial<ClickOptions>): Chainable<Subject>;
    type(text: string, options?: Partial<TypeOptions>): Chainable<Subject>;
    clear(options?: Partial<ClearOptions>): Chainable<Subject>;
    check(options?: Partial<CheckOptions>): Chainable<Subject>;
    uncheck(options?: Partial<CheckOptions>): Chainable<Subject>;
    select(value: string | string[], options?: Partial<SelectOptions>): Chainable<Subject>;
    
    // Assertions
    should(chainers: string, value?: any): Chainable<Subject>;
    should(fn: (currentSubject: Subject) => void): Chainable<Subject>;
    
    // Viewport
    viewport(width: number, height: number): Chainable<null>;
    viewport(preset: string): Chainable<null>;
    
    // Custom commands from commands.js
    login(email: string, password: string): Chainable<any>;
    addTransaction(description: string, amount: number, type: string, category: string): Chainable<any>;
    setupCategory(name: string, budget: number, color?: string): Chainable<any>;
    checkBudgetAlert(categoryName: string, expectedStatus: string): Chainable<any>;
  }

  interface TypeOptions extends Loggable, Timeoutable {
    delay: number;
    force: boolean;
    release: boolean;
  }

  interface ClickOptions extends Loggable, Timeoutable {
    force: boolean;
    multiple: boolean;
  }

  interface CheckOptions extends Loggable, Timeoutable {
    force: boolean;
  }

  interface ClearOptions extends Loggable, Timeoutable {
    force: boolean;
  }

  interface SelectOptions extends Loggable, Timeoutable {
    force: boolean;
  }

  interface VisitOptions {
    url: string;
    method?: string;
    body?: string;
    headers?: { [key: string]: string };
    timeout?: number;
    failOnStatusCode?: boolean;
    retryOnNetworkFailure?: boolean;
    retryOnStatusCodeFailure?: boolean;
    onBeforeLoad?: (contentWindow: Window) => void;
    onLoad?: (contentWindow: Window) => void;
  }

  interface Loggable {
    log: boolean;
  }

  interface Timeoutable {
    timeout: number;
  }

  interface Withinable {
    withinSubject: JQuery<HTMLElement>;
  }

  interface Shadow {
    includeShadowDom: boolean;
  }
}