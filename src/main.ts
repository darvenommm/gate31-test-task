import { defineFilter, FilterForm, FILTER_NAME, FILTER_FORM_ATTRIBUTES } from './components/filter';
import { defineCards, Cards, CARDS_NAME, CARDS_ATTRIBUTES } from './components/cards';

import './styles.scss';

const main = (): void => {
  defineFilter();
  defineCards();

  const filterForm = document.querySelector<FilterForm>(FILTER_NAME);
  const cards = document.querySelector<Cards>(CARDS_NAME);
  const output = document.querySelector<HTMLOutputElement>('output');

  if (!filterForm || !cards || !output) {
    throw Error('Not found filterForm or cards or output element in th page');
  }

  output.textContent = 'Active count: None';

  filterForm.setAttribute(FILTER_FORM_ATTRIBUTES.disabled, 'true');
  filterForm.filterCallback = (newFilter: string): void =>
    void cards.setAttribute(CARDS_ATTRIBUTES.filter, newFilter);

  cards.setAttribute(CARDS_ATTRIBUTES.filter, filterForm.filter);
  cards.loadedCallback = (): void => {
    filterForm.setAttribute(FILTER_FORM_ATTRIBUTES.disabled, 'false');
  };
  cards.renderCallback = (): void =>
    void (output.textContent = `Active count: ${String(cards.activeCardsCount)}`);

  window.removeEventListener('DOMContentLoaded', main);
};

window.addEventListener('DOMContentLoaded', main);
