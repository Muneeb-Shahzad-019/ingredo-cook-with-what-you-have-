import Splash from './pages/Splash';
import AccountSelection from './pages/AccountSelection';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import RecipeResults from './pages/RecipeResults';
import RecipeDetail from './pages/RecipeDetail';
import AddRecipe from './pages/AddRecipe';
import SavedRecipes from './pages/SavedRecipes';
import Profile from './pages/Profile';


export const PAGES = {
    "Splash": Splash,
    "AccountSelection": AccountSelection,
    "Onboarding": Onboarding,
    "Home": Home,
    "RecipeResults": RecipeResults,
    "RecipeDetail": RecipeDetail,
    "AddRecipe": AddRecipe,
    "SavedRecipes": SavedRecipes,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Splash",
    Pages: PAGES,
};