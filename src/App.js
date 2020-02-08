import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state={
      gameState:"start",
      singlePlayer:true
    }
  }

  changeGameState=(newGameState)=>{
    this.state={
      gameState:newGameState
    }
  }
  
  changeMode(){
    if(this.state.gameState!=="playing"){
      this.setState({
        singlePlayer:!this.state.singlePlayer
      })
    }
  }
  
  
  render() {
    return (
      <div className="App">
        <button className="changeMode" onClick={()=>{this.changeMode()}}>
          <p>Singleplayer: {(this.state.singlePlayer)?"on":"off"}</p>
        </button>
        <Game singlePlayer={this.state.singlePlayer} gameState={this.state.gameState} changeGameState={this.changeGameState}/>
      </div>
    );
  }
}

class Game extends Component {
  constructor(props){
    super(props)
    this.state={
      boardValues:Array(9).fill(null),
      xIsNext:true,
      winner:null,
      turn:0,
      enabled:true
    }
  }
  
  resetBoard(){
    this.props.changeGameState("start");
    this.setState({
      boardValues:Array(9).fill(null),
      xIsNext:true,
      winner:null,
      turn:0,
      enabled:true
    })
  }
  
  handleClick(i){
    if(this.state.winner===null && this.state.boardValues[i]===null && this.state.enabled){
      if(this.props.gameState!=="playing"){
        this.props.changeGameState("playing");
      }
      let boardCopy=this.state.boardValues.slice();
      if(this.state.xIsNext){
        boardCopy[i]="x"
      } else {
        boardCopy[i]="o"
      }
      this.setState({
        xIsNext:!this.state.xIsNext,
        boardValues:boardCopy,
        turn:this.state.turn+1
      },()=>{
        let winner=this.getWinner(boardCopy);
        if(winner!==null){
          this.setState({
            winner:winner
          })
        } else {
          if(this.props.singlePlayer&& !this.state.xIsNext){
            this.setState({
              enabled: false
            },()=>{
              let move=this.getBestMove();
              setTimeout(()=>{
                this.setState({
                  enabled:true
                },()=>this.handleClick(move[1]))
              },500);
            })
          }
        }
      })
    }
  }
  
  getWinner(boardValues){
    const winningCombos=[
      [0,3,6],
      [0,1,2],
      [0,4,8],
      [1,4,7],
      [2,5,8],
      [2,4,6],
      [3,4,5],
      [6,7,8]
    ]
    let result=null
    winningCombos.forEach((combo)=>{
      let player = boardValues[combo[0]];
      if (player===null) return;
      let win=true;
      for(let i=1; i<combo.length; i++){
        if(player!==boardValues[combo[i]]){
          win=false;
          break;
        }
      }
      if(win){
        result= player;
        return;
      }
    })
    return result
  }
  
  /*
    we use the minmax algorithm where the o player wants the score to be the smallest possible and the x wants it to be the biggest
  */
  getBestMove(board=this.state.boardValues,turn=0,xIsNext=this.state.xIsNext){
    board=board.slice()
    let scores=[];  
    let result=[-1,-1];
    turn++;
    for(let i=0;i<board.length;i++){ // we simulate every possible move and assign it score
      
      if(board[i]===null){  
        result[1]=i;
        if(xIsNext){
          board[i]='x'
        } else {
          board[i]='o'
        }
        let winner=this.getWinner(board);
        
        let score=100-turn;
        switch(winner){    //if the move causes somebody to win we return the score and the move
          case 'o':
            return [-score,i]
            
          case 'x':
            return [score,i]
            
          default:    //else the algorithm simulates the rest of the game playing against itself
            scores.push([this.getBestMove(board,turn,!xIsNext)[0],i])
        }
        board[i]=null;
      }
    }
    if(result[1]===-1) return [0,0];
    if(result[0]===-1) result=scores[0]
    if(xIsNext){                          //the algorithm selects the best choice for its side
      for(let i=0;i<scores.length;i++){
        if(result[0]<scores[i][0]){
          result=scores[i]
        }
      }
    } else {
      for(let i=0;i<scores.length;i++){
        if(result[0]>scores[i][0]){
          result=scores[i]
        }
      }
    }
    return result;
  }
  
  
  render(){
    let squares=[];
    
    for(let i=0;i<9;i++){
      squares.push(<Square value={this.state.boardValues[i]} onClick={()=>this.handleClick(i)}/>)
    }
    

    let result="";
    if(this.state.turn===9){
      result="DRAW"
    }
    if(this.state.winner!==null){
      if(this.state.winner==='x'){
        result="X WINS!"
      } else {
        result="O WINS!"
      }
    }
    
    return (
      <div className="Game">
        <div className="board">
          {squares}
        </div>
        <button className="reset" onClick={()=>this.resetBoard()}>
          <p>Reset game</p>
        </button>
        <div className="result">
          <p>{result}</p>
        </div>
      </div>
    )
  }
}

class Square extends Component {
  render(){
    return (
      <button type="button" className="Square" onClick={()=>{this.props.onClick();}}>
        <p className="tick">{this.props.value}</p>
      </button>
    )
  }
}





export default App;
