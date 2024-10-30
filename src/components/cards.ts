import { CARD_NAME, CardAttributes } from './card';

import type { ICard } from '../types';

export const CardsAttributes = {
  filter: 'filter',
} as const;

export const CARDS_NAME = 'custom-cards';

export const defineCards = (): void => {
  if (!customElements.get(CARDS_NAME)) {
    customElements.define(CARDS_NAME, Cards);
  }
};

const enum CardsState {
  LOADING,
  ERROR,
  SUCCESS,
}

class Cards extends HTMLElement {
  public static readonly observedAttributes = [CardsAttributes.filter];

  private readonly CARDS_URL = 'https://jsonplaceholder.typicode.com/posts/?_start=0&_limit=7';
  private currentState = CardsState.LOADING;
  private cards: ICard[] = [];
  private errorMessage: null | string = null;

  public connectedCallback(): void {
    this.setDefaultAttributes();
    this.loadCards();
    this.render();
  }

  public attributeChangedCallback(): void {
    this.render();
  }

  private async loadCards(): Promise<void> {
    try {
      const response = await fetch(this.CARDS_URL);
      this.cards = (await response.json()) as ICard[];
      this.currentState = CardsState.SUCCESS;
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        this.errorMessage = error.message;
      }

      this.currentState = CardsState.ERROR;
    }

    this.render();
  }

  private render(): void {
    switch (this.currentState) {
      case CardsState.LOADING:
        return this.renderLoader();

      case CardsState.ERROR:
        return this.renderError();

      case CardsState.SUCCESS:
        return this.renderCards();
    }
  }

  private renderLoader(): void {
    this.replaceChildren();

    const text = document.createElement('p');
    text.textContent = 'Loading...';

    this.append(text);
  }

  private renderError(): void {
    this.replaceChildren();

    const text = document.createElement('p');
    text.textContent = `Error: ${this.errorMessage ?? 'Something went wrong'}`;

    this.append(text);
  }

  private renderCards(): void {
    try {
      this.replaceChildren();

      const filter = this.getAttribute(CardsAttributes.filter) ?? '';
      const filteredCards = Boolean(filter)
        ? this.cards.filter((card): boolean => card.title.includes(filter))
        : this.cards;

      const container = document.createElement('ul');
      const elements = filteredCards.map((card): HTMLElement => {
        const element = document.createElement(CARD_NAME);
        element.setAttribute(CardAttributes.title, card.title);
        element.setAttribute(CardAttributes.content, card.body);

        return element;
      });

      container.append(...elements);

      this.append(container);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        this.errorMessage = error.message;
      }

      this.currentState = CardsState.ERROR;
      this.render();
    }
  }

  private setDefaultAttributes(): void {
    if (!this.getAttribute(CardsAttributes.filter)) {
      this.setAttribute(CardsAttributes.filter, '');
    }
  }
}
