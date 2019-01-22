import React, { Component } from 'react'
import {EventEmitter} from 'fbemitter'
import PostManager from './PostManager'
import axios from 'axios'
const SERVER = "https://project-secareanumihaela.c9users.io"


const emitter = new EventEmitter()
const postManager = new PostManager(emitter)

class PostList extends Component{
    
    constructor(props){
        super(props)
        this.state = {
        companyName: '',
        posts: [],
        noTries: 10
        }
        this.inputText =  React.createRef()
        this.handleBlur = this.handleBlur.bind(this)
        this.cauta = this.cauta.bind(this)
        this.afiseaza = this.afiseaza.bind(this)
    }
    
    handleBlur(event){
      let value = event.target.value
      let name = event.target.name 
      this.setState({
        [name] : value
      })
    }

   cauta(event){
        this.inputText.current.value = ''
        this.noTries = 10
      this.appendFirm({name: this.state.companyName})
    }
    
    afiseaza(){
      postManager.getAll(this.state.companyName)
      emitter.addListener('POSTS_LOAD',() => {
          if(postManager.content.length === 0 && this.noTries !== 0){
              this.afiseaza()
              this.noTries--
          }
        this.setState({
          posts: postManager.content
        })
      })
    }
    
    
    appendFirm(company){
        if (company !== '' && company !== ' ') {
        axios({
            method: 'post',
            url: SERVER + '/companies',
            headers: {'Content-Type' : 'application/json'},
            data : company
        })
        .then(() => {
            this.afiseaza()
        })
        .catch((error)=>console.warn(error))
        }
    }
    
 render() {
     
    return (
        <div>
       <form id="form">
       Nume firma: <input type="text"  ref = {this.inputText} onBlur={this.handleBlur} defaultValue='' name="companyName"/>
       <input type = "button" value="Cauta" onClick={this.cauta} />
       </form>
      <ul id="list">
          {this.state.posts.map((e) =>
          <li id = "listItem">
          {e.posted_at}<br/>
          <div id="user">{e.user}</div>
         <div id = "text"> {e.text}</div>
        </li>
          )}
        </ul> 
        </div>
    );
  }
}

export default PostList;