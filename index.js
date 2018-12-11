const readline = require('readline-sync');
const crypto = require('crypto');

const cardSpecial = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const cardFace = ['C', 'D', 'H', 'S'];
var max_depth = 3

// Ai Playing Card
const getAISelectedCards = (isOdd, currentDeckP1, currentDeckP2, p1_selectedCards, highestCardValue) => {
    return new Promise((resolve, reject) => {
        var action
        var maxVal = -100
        const a = 5
        const b = -5
        const p2_selectedCard = getPossibleCard(p1_selectedCards,SortArray(allExpand(currentDeckP2)),currentDeckP2,isOdd)
        if (p2_selectedCard.length == 1) {
            resolve(p2_selectedCard[0])
        } else if (p2_selectedCard.length == 0) {
            resolve([])
        } else {
            p2_selectedCard.forEach(element => {
                var currentDeckP2_slice = currentDeckP2.slice();
                element.forEach(e => {
                    currentDeckP2_slice.splice(currentDeckP2_slice.indexOf(e),1)
                })
                min_value_function(element,currentDeckP1,currentDeckP2_slice,a,b,0,highestCardValue,isOdd).then((results)=> {
                    if (results > maxVal) {
                        maxVal = results
                        action = element
                        resolve(action)
                    }
                })
            });
        }
    })
}

const heuristic = (state,highestCardValue)=>{
    const groupNode = GroupNode(state)
    return groupNode.length
}

const min_value_function = (p2_selectedCard,currentDeckP1,currentDeckP2,a,b,level,highestCardValue,isOdd) =>{
    return new Promise((resolve, reject) => {
        if (level >= max_depth) {
            const ret_u = heuristic(currentDeckP2,highestCardValue)
            resolve(ret_u)
        } else {
            if(currentDeckP2.length == 0) {
                resolve(99)
            }
            const p1_selectedCard = getPossibleCard(p2_selectedCard,SortArray(allExpand(currentDeckP1)),currentDeckP1,isOdd)
            if (p1_selectedCard.length == 0){
                resolve(99) 
            }
            let v = 100
            p1_selectedCard.forEach(element => {
                var currentDeckP1_slice = currentDeckP1.slice();
                element.forEach(e => {
                    currentDeckP1_slice.splice(currentDeckP1_slice.indexOf(e),1)
                })
                max_value_function(element,currentDeckP1_slice,currentDeckP2,a,b,level+1,highestCardValue,isOdd).then((results)=>{
                    v = Math.min(v,results)
                    resolve(v)
                })
            });
        }
    })
}

const max_value_function = (p1_selectedCard,currentDeckP1,currentDeckP2,a,b,level,highestCardValue,isOdd)=>{
    return new Promise((resolve, reject) => {
        if (level >= max_depth) {
            const ret_u = heuristic(currentDeckP1,highestCardValue)
        } else {
            if(currentDeckP1.length == 0) {
                resolve(-99)
            }
            const p2_selectedCard = getPossibleCard(p1_selectedCard,SortArray(allExpand(currentDeckP2)),currentDeckP2,isOdd)
            let v = -100
            if (p2_selectedCard.length == 0){
                resolve(-99) 
            }
            p2_selectedCard.forEach(element => {
                var currentDeckP2_slice = currentDeckP2.slice();
                element.forEach(e => {
                    currentDeckP2_slice.splice(currentDeckP2_slice.indexOf(e),1)
                })
                if(currentDeckP2_slice.length == 0){
                    resolve(-99)
                } else {
                min_value_function(element,currentDeckP1,currentDeckP2_slice,a,b,level+1,highestCardValue,isOdd).then((results)=>{
                    v = Math.max(v,results)
                    resolve(v)
                })
                }
            });
        }

    })
}

// Check Win State
const is_win = (state) => {
    if (state.length == 0) {
        return true
    }
    return false
}

const SortArray = (data) => {
    var buffer = []
    for(let i = 0; i < data.length;i++) {
        for (let j = 0; j < data[i].length;j++) {
            buffer.push(data[i][j])
        }
    }
    return buffer
}

// Run Expand
const allExpand = (data) => {
    var selectedAllPossible = []
    var x = GroupNode(data)
    for(let i = 0;i < x.length;i++) {
       selectedAllPossible.push(filterUndefined(ExpandPossibleNode(x[i])))
    }
    return selectedAllPossible
}

// Filter Array
const filterUndefined = (selectcard) => {
    var filter = []
    for (let j = 0; j < selectcard.length; j++) {
        if (selectcard[j].includes(undefined) == false && selectcard[j].length != 0){
            filter.push(selectcard[j])
        }
    }
    return filter
}

// Expand Card Based on Type of Card
const ExpandPossibleNode = (data) => {
    index = [[0],[1],[2],[3],[0,1],[0,2],[0,3],[1,2],[1,3],[2,3],
            [0,1,2],[0,1,3],[0,2,3],[1,2,3],
            [0,1,2,3]]
    selectedCard = []
    for(let i = 0; i < index.length;i++) {
        buffer = []
        for (let j = 0; j < index[i].length; j++) {
            if (data.length >= index[i].length) {
                buffer.push(data[index[i][j]])
            }
        }
        selectedCard.push(buffer)
    }

    return selectedCard
}

// Group The Same Number Card
const GroupNode = (data) => {
    var buffer = []
    var groupNode = []
    for(let i = 0; i < data.length;i++) {
        if (parseInt((data[i]+4)/4) == parseInt((data[i+1]+4)/4)){
            buffer.push(data[i])
        } else {
            buffer.push(data[i])
            groupNode.push(buffer)
            buffer = []
        }
    }
    return groupNode
}

// List All Possible Card
const getPossibleCard = (p1SelectedCard,p2SelectedCard,p2Card,isOdd) => {
    var PossibleCardP2 = []
    for(let i = 0; i < p2SelectedCard.length;i++) {
        if(isSelectedCardCanPlay(p1SelectedCard, p2SelectedCard[i]) && (!(validateSelectedCards(isOdd, p2SelectedCard[i],p2Card).isError))) {
            PossibleCardP2.push(p2SelectedCard[i])
        }
    }
    return PossibleCardP2
}

// Check Condition Playing Card 
const isSelectedCardCanPlay = (p1SelectedCard,p2SelectedCard) => {
    for(let i = 0; i < p1SelectedCard.length;i++) {
        var maxTypeCard
        for(let j = 0; j < p2SelectedCard.length;j++) {
            const checkNumberP1 = parseInt((p1SelectedCard[i] + 4)/4)
            const checkTypeCardP1 = parseInt((p1SelectedCard[i]%4))
            const checkNumberP2 = parseInt((p2SelectedCard[j] + 4)/4)
            const checkTypeCardP2 = parseInt((p2SelectedCard[j]%4))
            if (checkNumberP2 > checkNumberP1) {
                // console.log();
            } else if (checkNumberP2 == checkNumberP1){
                if (checkTypeCardP2 < checkTypeCardP1){
                    maxTypeCard = checkTypeCardP2
                } else {
                    if (maxTypeCard < checkTypeCardP1){
                        // console.log();
                    } else {
                        return false
                    }
                }
            } else {
                return false
            }
        }
    }
    return true
}

const sortNumber = (a, b) => {
  return a - b;
}

const convertNumToCard = (cardNum) => {
  const card = Math.floor(cardNum / 4);
  const faceNum = cardNum % 4;
  let cardName;
  cardName = cardSpecial[card];
  cardName += cardFace[faceNum];
  return cardName;
}

const validateSelectedCards = (isOdd, selectedCards, currentDeck, previousCardPoint,isPower) => {
  let result = {};
  result.isError = false;
  result.msg = null;
  if (isOdd != null) {
    if (isOdd){
      if (selectedCards.length % 2 == 0) {
        result.isError = true;
        result.msg = "you can't use even cards on this round";
        return result;
      }
      if((Math.floor(selectedCards.length /3) === 0) && isPower){
        result.isError = true;
        result.msg = "you must use 3 cards";
        return result;
      }
    }
    else{
      if (selectedCards.length % 2 == 1) {
        result.isError = true;
        result.msg = "you can't use odd cards on this round";
        return result;
      }
      if((Math.floor(selectedCards.length /3) === 0) && isPower){
        result.isError = true;
        result.msg = "you must use 4 cards";
        return result;
      }
    }
  }

  let representCardNum = null;  
  let selectedCardsUsed = [];
  selectedCards.forEach(element => {
    let selectedCardNum = Math.floor(element/4);
    if(representCardNum != null && selectedCardNum != representCardNum){
      result.msg = "you must use same card number for multiple cards";
      result.isError = true;
      return;
    }
    representCardNum = selectedCardNum;
    if (currentDeck.indexOf(element) === -1) {
      result.msg = "you don't have the card";
      result.isError = true;
      return;
    }
    if(previousCardPoint != null && element < previousCardPoint){
      if(isPower !== true && Math.floor(selectedCards.length/2) == 0){
        result.msg = "you can't use lower point cards";
        result.isError = true;
        return;
      }
    }
    if(selectedCardsUsed.indexOf(element) != -1){
      result.msg= "you can't use same card multiple times";
      result.isError = true;
      return;
    }
    else{
      selectedCardsUsed.push(element);
    }
  });
  
  return result;
}

const convertCardToNum = (cardName) => {
  let inputCardFace = cardName.substr(cardName.length - 1, 1).toUpperCase();
  let inputCardNum = cardName.substr(0, cardName.length - 1);
  inputCardNum = cardSpecial.indexOf(inputCardNum);
  inputCardFace = cardFace.indexOf(inputCardFace);
  let selectedCard = inputCardNum * 4 + inputCardFace;
  return selectedCard;
}

const assignDeck = (time, pDeck, totalCardNum, cb) => {
  if (time >= totalCardNum / 2) {
    return cb(pDeck);
  }
  let clonePDeck = Object.assign({}, pDeck);
  const p1Deck = clonePDeck.p1Deck;
  const p2Deck = clonePDeck.p2Deck;
  crypto.randomBytes(1, (err, rbValue) => {
    const p1DeckSize = p1Deck.length;
    const hexValue = rbValue.toString('hex');
    const index = parseInt(hexValue, 16) % p1DeckSize;
    p2Deck.push(p1Deck[index]);
    p1Deck.splice(index, 1);
    assignDeck(time + 1, clonePDeck, totalCardNum, (newDeck) => {
      return cb(newDeck);
    });
  });
}

highestCardNum = readline.question("Please input highest card number (1-13): ");
let isNotOver = true;
let p1Deck = Array.apply(null, { length: highestCardNum * 4 }).map(Function.call, Number);
let pDeck = { p1Deck, p2Deck: [] };
assignDeck(0, pDeck, highestCardNum * 4, (newDeck) => {
  newDeck.p1Deck.sort(sortNumber);
  newDeck.p2Deck.sort(sortNumber);
  let isOdd = null;
  let previousCardPoint = null;
  let isPower = false;
  while (isNotOver) {
    console.log('Your current Card: ');
    newDeck.p1Deck.forEach(element => {
      process.stdout.write(convertNumToCard(element) + ' ');
    });
    console.log();
    if (isOdd == null) {
      console.log('====== NEW ROUND ======');
      previousCardPoint = null;
      isPower = false;
    }
    else {
      process.stdout.write((isOdd ? '[Odd]' : '[Even]') + ' ');
    }
    cardstr = readline.question("enter your cards (use space for multiple cards, type F to forfeit this round) : ");
    let selectedCards = [];
    if (!(cardstr.toUpperCase() === 'F')) {
      let cards = cardstr.split(" ");
      cards.forEach(element => {
        selectedCards.push(convertCardToNum(element));
      });
    }
    else {
      console.log();
      console.log('You have forfeit this round!');
      console.log();
      isOdd = null;
    }
    let validateResult = validateSelectedCards(isOdd,selectedCards,newDeck.p1Deck,previousCardPoint,isPower);
    if (!validateResult.isError) {
      if (selectedCards.length > 0) {
        if (selectedCards.length % 2 == 0) {
          isOdd = false;
        }
        else {
          isOdd = true;
        }
        if(selectedCards.length > 2){
          isPower = true;  
        }
      }
      selectedCards.forEach(element => {
        let index = newDeck.p1Deck.indexOf(element);
        newDeck.p1Deck.splice(index, 1);
      });
      // aiSelectedCards
      getAISelectedCards(isOdd, newDeck.p1Deck, newDeck.p2Deck, selectedCards, highestCardNum * 4).then((aiSelectedCards) =>{
        console.log(aiSelectedCards);
        if (aiSelectedCards.length === 0) {
          console.log();
          console.log('AI has been forfeit this round!');
          console.log();
          isOdd = null;
        }
        else {
          console.log('AI Choose: ');
          if (aiSelectedCards.length % 2 === 0) {
            isOdd = false;
          }
          else {
            isOdd = true;
          }
          if(aiSelectedCards.length > 2){
            isPower = true;
          }
          aiSelectedCards.forEach(element => {
            if(previousCardPoint == null || previousCardPoint < element){
              previousCardPoint = element;
            }
            process.stdout.write(convertNumToCard(element) + ' ');;
            let index = newDeck.p2Deck.indexOf(element);
            newDeck.p2Deck.splice(index, 1);
          });
          console.log();
        }
      })
    }
    else{
      console.log(validateResult.msg);
    }
    if (newDeck.p1Deck.length === 0 || newDeck.p2Deck.length === 0) {
      isNotOver = false;
      if (newDeck.p1Deck.length === 0) {
        console.log("Player win this match!");
      }
      else {
        console.log("AI win this match!");
      }
    }
    console.log();
    console.log("===============================================");
    console.log();
  }
});

// getAISelectedCards(true,[ 0, 5, 6, 8, 10, 13, 15 ], [2, 3, 4, 7, 9, 11, 12, 14],[ 1 ],4).then((results)=>{
//     console.log('results',results)
// })