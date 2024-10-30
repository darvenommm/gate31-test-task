import { defineCards } from './components/cards';
import { defineCard } from './components/card';

const main = (): void => {
  defineCard();
  defineCards();

  window.removeEventListener('DOMContentLoaded', main);
};

window.addEventListener('DOMContentLoaded', main);
