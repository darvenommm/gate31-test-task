export const CARD_NAME = 'custom-card';

export const defineCard = (): void => {
  if (!customElements.get(CARD_NAME)) {
    customElements.define(CARD_NAME, Card);
  }
};

export const CardAttributes = {
  title: 'title',
  content: 'content',
} as const;

class Card extends HTMLElement {
  static observedAttributes = [CardAttributes.title, CardAttributes.content];

  public connectedCallback(): void {
    this.setDefaultAttributes();
    this.render();
  }

  public attributeChangedCallback(): void {
    this.render();
  }

  private render(): void {
    this.replaceChildren();

    const title = document.createElement('h2');
    title.textContent = this.getAttribute(CardAttributes.title)!;

    const content = document.createElement('p');
    content.textContent = this.getAttribute(CardAttributes.content)!;

    const container = document.createElement('li');
    container.append(title, content);

    this.append(container);
  }

  private setDefaultAttributes(): void {
    if (!this.getAttribute(CardAttributes.title)) {
      this.setAttribute(CardAttributes.title, 'Not set title');
    }

    if (!this.getAttribute(CardAttributes.content)) {
      this.setAttribute(CardAttributes.content, 'Not set content');
    }
  }
}
