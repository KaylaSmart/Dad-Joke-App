import React, { Component } from 'react';
import './JokeList.css';
import axios from 'axios';
import uuid from "uuid/v4"
import Joke from './Joke'


class JokeList extends Component {
    static defaultProps ={
        numJokesToGet: 10
    }
    //initialize state
    constructor(props){
        //use existing jokes, if localS is empty then get new jokes in an empty array
        super(props);
            this.state ={
                jokes:  JSON.parse(window.localStorage.getItem("jokes") || '[]'),
                loading: false
            }
            //to confirm that we do not hve duplicates this will give us the only the text of the jokes
           this.seenJokes = new Set(this.state.jokes.map(j => j.text));     
           this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount(){
        //if there are no jokes in state at the time , run the get jokes function
        if(this.state.jokes.length === 0) this.getJokes();
      

    }
     //load jokes 
    async getJokes(){
        try{
        let jokes =[];
        //using whle to get 10 unique jokes
        while(jokes.length < this.props.numJokesToGet){
                 let res = await axios.get("https://icanhazdadjoke.com/", 
                 { headers: { Accept: "application/json" }
         });
         let newJoke = res.data.joke;
         //if seenJokes set does not have the newJoke, then push it into the arra, if it does it wll not make it into the list
         if(!this.seenJokes.has(newJoke)){
             jokes.push({id:uuid(), text: newJoke, votes: 0});
         }else{
    
             console.log("FOund Duplicate");
             console.log(newJoke);
         }
     }
       this.setState(st =>({
           //combining the jokes currently in state with new jokes pulled after the handleClick function
           loading:false,
           jokes: [...st.jokes, ...jokes]
       }),
        () => 
            window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        )
    } catch(e){
        alert(e);
        this.setState({loading:false})
     }
    }
    //takes an id nd a number
    //pass down this method to joke
    handleVotes(id, delta){
        //make a new object containing old jokes but update the votes unless 
        this.setState(
            st =>({
                jokes: st.jokes.map( j =>
                    j.id === id ? {...j, votes: j.votes + delta} : j
                    )
            }),
            () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    }

    handleClick(){
        //when the new joke button is clicked, run the loader then pull new jokes
        this.setState({loading:true}, this.getJokes);
    }

    render(){
        if(this.state.loading){
            return(
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="JokesList-title">Loading...</h1>
                </div>
            )
        }

        //beofre the jokes are rendered sort them based on num of votes 
        let jokes = this.state.jokes.sort((a,b)=> b.votes - a.votes);
        return(
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <div className="JokeList-title">
                        <h1><span>Dad</span>Jokes</h1>
                     <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
                    <button className="JokeList-button" onClick={this.handleClick}>New Jokes</button>
                    </div>
                </div>  
                <div className="JokeList-jokes">
                    {jokes.map( j => (
                        <Joke  
                            key={j.id} 
                            votes={j.votes} 
                            text={j.text}  
                            upvote={() =>this.handleVotes(j.id, 1)} 
                            downvote={() => this.handleVotes(j.id, -1)}
                         />
                    ))}
                </div>
            </div>
        )
    }

}

export default JokeList;