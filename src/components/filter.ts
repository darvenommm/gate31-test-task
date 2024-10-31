export const FILTER_NAME = 'filter-form';

export const defineFilter = (): void => {
  if (!customElements.get(FILTER_NAME)) {
    customElements.define(FILTER_NAME, FilterForm);
  }
};

export const FILTER_FORM_ATTRIBUTES = {
  disabled: 'disabled',
} as const;

type FilterCallback = (newFilter: string) => void;

export class FilterForm extends HTMLElement {
  public static readonly observedAttributes = [FILTER_FORM_ATTRIBUTES.disabled];

  public filter: string = '';
  public filterCallback: FilterCallback | null = null;

  public constructor() {
    super();
    this.filter = new URLSearchParams(window.location.search).get('filter')?.trim() ?? '';
  }

  public connectedCallback(): void {
    this.filterCallback?.(this.filter);
    this.setAttribute(
      FILTER_FORM_ATTRIBUTES.disabled,
      this.getAttribute(FILTER_FORM_ATTRIBUTES.disabled) ?? 'false',
    );
  }

  public attributeChangedCallback() {
    this.render();
  }

  private render(): void {
    const form = document.createElement('form');
    form.addEventListener('submit', (event): void => {
      event.preventDefault();
      const target = event.target as HTMLFormElement;

      const formData = new FormData(target);
      const newFilter = formData.get('filter')!.toString().trim();

      this.filter = newFilter;

      const newUrl = new URL(window.location.href);
      if (newFilter) {
        newUrl.searchParams.set('filter', this.filter);
      } else {
        newUrl.searchParams.delete('filter');
      }
      history.pushState({}, '', newUrl);

      this.filterCallback?.(newFilter);

      const input = target.querySelector<HTMLInputElement>('input')!;
      input.value = input.value.trim();
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'filter';
    input.placeholder = 'input filter...';
    input.value = this.filter;
    input.disabled = this.getAttribute(FILTER_FORM_ATTRIBUTES.disabled) === 'true';

    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Set filter';
    button.disabled = this.getAttribute(FILTER_FORM_ATTRIBUTES.disabled) === 'true';

    form.append(input, button);

    this.replaceChildren(form);
  }
}
