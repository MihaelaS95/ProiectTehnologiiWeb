import axios from 'axios'
const SERVER = "https://project-secareanumihaela.c9users.io"

class PostManager{
    constructor(ee){
        this.emitter = ee
        this.content = []
    }
    
    getAll(companyName){
        axios({
            method: 'get',
            url: SERVER + '/posts/' + companyName})
        .then((response)=>{
            this.content = response.data
            this.emitter.emit('POSTS_LOAD')
        })
        .catch((error)=> console.warn(error))
    }
}
 
    export default PostManager;