/*
Build a Recipe Box

Objective:  Build a CodePen.io a Recipe Box app that is functionally similar to 
            this: https://codepen.io/FreeCodeCamp/full/xVXWag/.
User Story: I can create recipes that have names and ingredients.
User Story: I can see an index view where the names of all the recipes are visible.
User Story: I can click into any of those recipes to view it.
User Story: I can edit these recipes.
User Story: I can delete these recipes.
User Story: All new recipes I add are saved in my browser's local storage. 
            If I refresh the page, these recipes will still be there.

Notes: I just completed this project, which took about 24 hours. I wasn't used
       to the class XXX extends React.component syntax, as I've only used the 
       var XXX = React.createClass syntax so far. BTW, I don't mind using classes,
       but I thought all the JS grand poobahs claimed that one of JS's advantages
       was objects without classes. So why is React changing over to classes?
       Whatever. In any event, after writing this project, I now have a much 
       better handle on using props, child components, controlled components,
       passing data between components, etc. 

       I did run into one design issue on this project. I needed an modal form
       to handle Adding Recipes and Editing Recipes. The question I needed to
       answer was should I have one generic modal or two specific modals? In other 
       words, should I have an Add Modal component and an Edit Modal component?
       Or should I have one component that takes a few props and works for both 
       Adds and Edits? This is the Don't Repeat Yourself (DRY) vs Do One Thing (DOT) 
       conflict. I went with one Modal (following DRY coding) and when Save is 
       pressed a function will then decide if the data should be given to an Add 
       or Update function, which maintains the DOT coding principle.
*/

class Modal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {recipeName: "", recipeIngredients: "", chgFlag: false};
      this.handleChange = this.handleChange.bind(this);
    }
    
    handleChange(event) {
      if (this.state.chgFlag == false) {
        // You can't initialize this.state with this.props in the constructor, so it's done here
        var recipeName = this.props.recipeName;
        var recipeIngredients = this.props.recipeIngredients;
        this.setState({recipeName: recipeName, recipeIngredients: recipeIngredients, chgFlag: true});
      }
      this.setState({[event.target.name]: event.target.value, chgFlag: true});
    }
    
    handleSave() {
      this.props.saveClick(this.props.recipeIndex, this.refs.recipeName.value, this.refs.recipeIngredients.value);
      this.setState({recipeName: "", recipeIngredients: "", chgFlag: false});
    }
    
    render () {
      // Note: use this.props on the first render, but use this.state once they make a change
      if (this.state.chgFlag == false) {
        var recipeName = this.props.recipeName;
        var recipeIngredients = this.props.recipeIngredients;
      } else {
        recipeName = this.state.recipeName;
        recipeIngredients = this.state.recipeIngredients
      }
      return (
        <div className="modal" style={this.props.modalDisplay}>
          <div className="modalBox">
            <div className="modalHeader">
              <div className="close" onClick={() => this.props.cancelClick()}>&times;</div>
              <h3>{this.props.modalTitle}</h3>
            </div>
            <div className="modalContent">
              <h4>Recipe Name: </h4>
              <input 
                type="textbox" 
                className="tbRecipeName" 
                name="recipeName" 
                ref="recipeName" 
                value={recipeName}
                onChange={this.handleChange}
              />
              <h4>Ingredients: </h4>
              <textarea 
                rows="2" 
                cols="50" 
                className="tbIngredients" 
                ref="recipeIngredients" 
                name="recipeIngredients" 
                value={recipeIngredients}
                onChange={this.handleChange}
              />
            </div>
            <div className="modalFooter">
              <button onClick={this.handleSave.bind(this)}>Save</button>
            </div>
          </div>
        </div>
      )
    }
  }
  
  function Ingredient(props) {
    return (
      <div className="ingredient">&bull; {props.name}</div>
    )
  }
  
  class Recipe extends React.Component {
    render () {
      if (this.props.active == true) {
        return (
          <div className="recipe">
            <div onClick={() => this.props.onClick(this.props.index)}>{this.props.name}</div>
            {this.props.ingredients.map(function(text, i) {
               return(<Ingredient key={i} name={text}></Ingredient>);
            })}
            <div className="line"></div>
            <button onClick={() => this.props.deleteClick(this.props.index)}>Delete</button>
            <button onClick={() => this.props.editClick(this.props.index)}>Edit</button>
          </div>
        )
      } else {
        return (
          <div className="recipe">
            <div onClick={() => this.props.onClick(this.props.index)}>{this.props.name}</div>
          </div>
        )
      }
    }
  }
  
  // This is the main parent code
  class RecipeBox extends React.Component {
    constructor(props) {
      super(props);
      var loaded = false;
      if (typeof(Storage) !== "undefined") {
        var retrievedData = localStorage.getItem("_DavidIvey_Recipes");
        if (retrievedData != "" && retrievedData != null && JSON.parse(retrievedData).length != 0) {
          this.state = {recipes: JSON.parse(retrievedData), modal: "none", currRecipeIndex: -1};
          loaded = true;
        } 
      }
      if (loaded == false) {
        this.state = {recipes: [{name: "Spaghetti", 
                                 active: true, 
                                 ingredients: ["Noodles", "Tomato Sauce", "Meatballs (optional)"]
                               },
                               {name: "Tacos", 
                                active: false, 
                                ingredients: ["Tortilla", "Meat", "Cheese", "Lettuce", "Tomato"]
                               },
                               {name: "Irish Breakfast", 
                                active: false, 
                                ingredients: ["Fried Eggs", "Rashers", "Black & White Pudding", "Fried Tomato", "Soda Bread", "Tea"]
                               }
                               ],
                      modal: "none",
                      currRecipeIndex: -1};
      }
      this.addRecipe = this.addRecipe.bind(this);
      this.cancelButton = this.cancelButton.bind(this);
      this.modalSaveButton = this.modalSaveButton.bind(this);
    }
    
    componentDidUpdate() {
      if (typeof(Storage) !== "undefined") {
        localStorage.setItem("_DavidIvey_Recipes", JSON.stringify(this.state.recipes));
      }
    }
  
    toggleActive(index) {
      var recipes = this.state.recipes.slice();
      if (recipes[index].active == true) {
        recipes[index].active = false;   
      } else {
        recipes[index].active = true;
      }
      this.setState({recipes: recipes});
    }
  
    deleteRecipe(index) {
      var recipes = this.state.recipes.slice();
      recipes.splice(index,1);
      this.setState({recipes: recipes});
    }
  
    editRecipe(index) {
      var modal = "editRecipe";
      this.setState({modal: modal, currRecipeIndex: index});
    }
    
    addRecipe() {
      var modal = "addRecipe";
      this.setState({modal: modal, currRecipeIndex: -1});
    }
  
    cancelButton() {
      var modal = "none";
      this.setState({modal: modal});
    }
    
    modalSaveButton(recipeIndex, recipeName, recipeIngredients) {
      const ADD = -1;
      if (recipeIndex == ADD) {
        this.modalAddRecipe(recipeName, recipeIngredients);
      } else {
        this.modalEditRecipe(recipeIndex, recipeName, recipeIngredients);
      }
      var modal = "none";
      this.setState({modal: modal});
    }
    
    modalAddRecipe (recipeName, recipeIngredients) {
      var recipes = this.state.recipes.slice();
      recipes.push({name: recipeName, active: false, ingredients: recipeIngredients.split(",")});
      this.setState({recipes: recipes});
    }
    
    modalEditRecipe (recipeIndex, recipeName, recipeIngredients) {
      var recipes = this.state.recipes.slice()
      recipes[recipeIndex].name = recipeName;
      recipes[recipeIndex].active = true;
      recipes[recipeIndex].ingredients = recipeIngredients.split(","); 
      this.setState({recipes: recipes});
    }
    
    render() {
      var modalDisplay = {display: "none"};
      var modalTitle = "";
      var recipeIndex = -1;
      var recipeName = "";
      var recipeIngredients = "";
      if (this.state.modal == "addRecipe") {
        modalDisplay = {display: "block"};
        modalTitle = "Add Recipe";
        recipeIndex = -1;
        recipeName = "";
        recipeIngredients = "";
      } else if (this.state.modal == "editRecipe") {
        modalDisplay = {display: "block"};
        modalTitle = "Edit Recipe";
        recipeIndex = this.state.currRecipeIndex;
        recipeName = this.state.recipes[recipeIndex].name;
        recipeIngredients = this.state.recipes[recipeIndex].ingredients;
      }
      return (
        <div>
          <div id="sig">By David Ivey</div>
          <h1>FCC Recipe Box</h1>
          <div className="recipeBox">
            <h2>Recipe Box</h2>
            {this.state.recipes.map((text, i) => {
               return(<Recipe 
                        key={i} 
                        index={i} 
                        name={text.name} 
                        active={text.active} 
                        ingredients={text.ingredients}
                        deleteClick={i => this.deleteRecipe(i)}
                        editClick={i => this.editRecipe(i)}
                        onClick={i => this.toggleActive(i)}>
                      </Recipe>);
            })}
            <button className="addRecipe" onClick={this.addRecipe}>Add Recipe</button>
          </div>
          <Modal
            modalDisplay={modalDisplay}
            modalTitle={modalTitle} 
            recipeIndex={recipeIndex}
            recipeName={recipeName}
            recipeIngredients={recipeIngredients}
            saveClick={this.modalSaveButton}
            cancelClick={this.cancelButton}
          />
        </div>
      )
    }
  }
  
  ReactDOM.render(<RecipeBox/>, document.getElementById('root'));