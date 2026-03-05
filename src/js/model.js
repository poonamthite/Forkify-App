import { API_URL, RESULTS_PER_PAGE, KEY } from './config.js';
import { getJSON, sendJSON } from './helpers.js';
export const state = {
  recipeData: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RESULTS_PER_PAGE,
  },
  bookmarks: []
};
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    cooking_time: recipe.cooking_time,
    image: recipe.image_url,
    publisher: recipe.publisher,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    title: recipe.title,
    sourcrUrl: recipe.sourcrUrl,
    ...recipe.key && { key: recipe.key }
  };
}
export const loadRecipe = async function (id) {
  try {
    const data = await getJSON(`${API_URL}/${id}?key=${KEY}`);
    state.recipeData = createRecipeObject(data);
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipeData.bookmarked = true;
    } else {
      state.recipeData.bookmarked = false;
    }
  } catch (err) {
    console.error(`${err} 🔥🔥🔥🔥🔥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}?search=${query}&key=${KEY}`);
    //console.log(data);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      }
    })
    state.search.page = 1;
    //console.log(state.search.results);
  } catch (err) {
    console.error(`error in loadSearchResults: ${err} 🔥🔥🔥🔥🔥`);
    throw err;
  }

}
export const getSearchResultsPage = function (page = state.search.page) { //default page is 1
  state.search.page = page; //update the page in the state
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end)
}
export const updateServings = function (newServings) {
  state.recipeData.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * newServings / state.recipeData.servings;
  })
  state.recipeData.servings = newServings;
}
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}
export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);
  state.recipeData.bookmarked = true;
  persistBookmarks();
}
export const deleteBookmark = function (id) {
  //delete the bookmark
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);
  //mark the recipe as not bookmarked
  if (state.recipeData.id === id) state.recipeData.bookmarked = false;
  persistBookmarks();
}

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith("ingredient") && entry[1] !== "").map(ing => {
      const ingArr = ing[1].replaceAll(" ", "").split(",")
      if (ingArr.length !== 3) throw new Error("Wrong ingredient fromat! Please use the correct format :)");
      const [quantity, unit, description] = ingArr;
      return { quantity: quantity ? +quantity : null, unit, description }
    });
    // push the details entered in the form to the API
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await sendJSON(`${API_URL}?key=${KEY}`, recipe);
    state.recipeData = createRecipeObject(data);
    addBookmark(state.recipeData);

  } catch (err) {
    throw err;
  }




}
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();