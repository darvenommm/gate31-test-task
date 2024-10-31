import type { ICard } from '../types';

export const CARDS_NAME = 'cards-list';

export const defineCards = (): void => {
  if (!customElements.get(CARDS_NAME)) {
    customElements.define(CARDS_NAME, Cards);
  }
};

const enum CARDS_STATE {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export const CARDS_ATTRIBUTES = { filter: 'filter' } as const;

type Card = ICard & { isActive: boolean };

export class Cards extends HTMLElement {
  public static readonly observedAttributes = [CARDS_ATTRIBUTES.filter];

  public loadedCallback: (() => void) | null = null;
  public renderCallback: (() => void) | null = null;

  private readonly CARDS_URL = 'https://jsonplaceholder.typicode.com/posts/?_start=0&_limit=7';
  private currentState = CARDS_STATE.LOADING;
  private cards: Card[] = [];
  private errorMessage: null | string = null;

  private _filter: string = '';
  private _cardsCount: number | null = null;
  private _activeCardsCount: number | null = null;

  public connectedCallback(): void {
    this.loadCards();

    this.render();
  }

  public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    console.log('Cards attributes change');

    if (name === CARDS_ATTRIBUTES.filter && oldValue !== newValue) {
      this.filter = newValue;
    }

    if (this.currentState === CARDS_STATE.SUCCESS) {
      this.render();
    }
  }

  public get filter(): string {
    return this._filter;
  }

  private set filter(newFilter: string) {
    this._filter = newFilter;
  }

  public get cardsCount(): number | null {
    return this._cardsCount;
  }

  private set cardsCount(newCardsCount: number) {
    if (newCardsCount < 0) {
      throw Error('Incorrect cardsCount value');
    }

    this._cardsCount = newCardsCount;
  }

  public get activeCardsCount(): number | null {
    return this._activeCardsCount;
  }

  private set activeCardsCount(newActiveCardsCount: number) {
    if (newActiveCardsCount < 0) {
      throw Error('Incorrect activeCardsCount value');
    }

    this._activeCardsCount = newActiveCardsCount;
  }

  private async loadCards(): Promise<void> {
    try {
      const response = await fetch(this.CARDS_URL);
      const responseCards: ICard[] = await response.json();
      this.cards = responseCards.map((card): Card => ({ ...card, isActive: false }));
      this.currentState = CARDS_STATE.SUCCESS;
      this.loadedCallback?.();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        this.errorMessage = error.message;
      }

      this.currentState = CARDS_STATE.ERROR;
    }

    this.render();
  }

  private render(): void {
    switch (this.currentState) {
      case CARDS_STATE.LOADING:
        return this.renderLoader();

      case CARDS_STATE.ERROR:
        return this.renderError();

      case CARDS_STATE.SUCCESS:
        const filteredCards = Boolean(this.filter)
          ? this.cards.filter((card): boolean => card.title.includes(this.filter!))
          : this.cards;

        this.cardsCount = filteredCards.length;
        this.activeCardsCount = filteredCards.reduce(
          (count, current): number => count + Number(current.isActive),
          0,
        );

        if (this.cardsCount) {
          this.renderFilteredCards(filteredCards);
        } else {
          this.renderEmpty();
        }

        this.renderCallback?.();

        break;

      default:
        throw Error('Incorrect currentState value');
    }
  }

  private renderLoader(): void {
    this.renderByCallback((): HTMLElement => {
      const text = document.createElement('p');
      text.textContent = 'Loading...';

      return text;
    });
  }

  private renderError(): void {
    this.renderByCallback((): HTMLElement => {
      const text = document.createElement('p');
      text.textContent = `Error: ${this.errorMessage ?? 'Something went wrong'}`;

      return text;
    });
  }

  private renderEmpty(): void {
    this.renderByCallback((): HTMLElement => {
      const text = document.createElement('p');
      text.textContent = 'There are not cards';

      return text;
    });
  }

  private renderFilteredCards(filteredCards: Card[]): void {
    try {
      this.renderByCallback((): HTMLElement => {
        const container = document.createElement('ul');
        const elements = filteredCards.map((card): HTMLElement => {
          const element = document.createElement('li');

          const title = document.createElement('h2');
          title.textContent = card.title;

          const body = document.createElement('p');
          body.textContent = card.body;

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = card.isActive;
          checkbox.addEventListener('change', (event) => {
            const needCard = this.cards.find((currentCard): boolean => card.id === currentCard.id);

            if (!needCard) return;

            needCard.isActive = (event.target as HTMLInputElement).checked;

            this.render();
          });

          element.append(title, body, checkbox);

          return element;
        });

        container.append(...elements);

        return container;
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        this.errorMessage = error.message;
      }

      this.currentState = CARDS_STATE.ERROR;
      this.render();
    }
  }

  private renderByCallback(callback: () => HTMLElement): void {
    this.replaceChildren(callback());
  }
}
