import * as model from './model.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookMarkReviewView from './views/bookMarkReview.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  //rendering recipt api call
  try {
    const id = window.location.hash.slice(1); // recipe id coming from URL
    if (!id) return;
    recipeView.renderSpinner();
    //to show selected recipe in the result view in pink color
    resultView.update(model.getSearchResultsPage());

    //load recipe
    await model.loadRecipe(id);

    // rendering recipe
    recipeView.render(model.state.recipeData);
    bookMarkReviewView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};
const controlSevings = function (newServings) {
  //update the recipe servings (in state)
  model.updateServings(newServings);
  //update the recipe view
  recipeView.update(model.state.recipeData);
}
const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();
    //1. get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2. load search results
    await model.loadSearchResults(query);
    const page = model.state.search.page;
    resultView.render(model.getSearchResultsPage(1));
    //render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(`${err} 🔥🔥🔥🔥🔥`);
    throw err;
  }
}
const controlPagination = function (goToPage) {
  resultView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
}

const controlAddBookmark = function () {
  //add or remove bookmark
  if (!model.state.recipeData.bookmarked) {
    model.addBookmark(model.state.recipeData);
  } else {
    model.deleteBookmark(model.state.recipeData.id);
  }
  //update the recipe view
  recipeView.update(model.state.recipeData);
  //render the bookmarks list
  bookMarkReviewView.render(model.state.bookmarks);
}
const controlBookmarks = function () {
  bookMarkReviewView.render(model.state.bookmarks);
}
const controlAddRecipe = async function (newRecipe) {

  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    //render the recipe
    recipeView.render(model.state.recipeData);
    //success message
    addRecipeView.renderMessage();

    bookMarkReviewView.render(model.state.bookmarks);

    //change id in url
    window.history.pushState(null, '', `#${model.state.recipeData.id}`);
    //close the window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error("💥", err.message);
    addRecipeView.renderError(err.message);
  }

}
// window.addEventListener('hashchange', showRecepie);
// window.addEventListener('load', showRecepie);
const init = () => {
  recipeView.addHandlerRender(controlRecipes);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerUpdateServings(controlSevings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  bookMarkReviewView.addHandlerRender(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();
///////////////////////////////////////
