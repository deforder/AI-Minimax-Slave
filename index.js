const readline = require('readline-sync');
const crypto = require('crypto');

const cardSpecial = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const cardFace = ['C', 'D', 'H', 'S'];

const getAISelectedCards = (isOdd, p1Deck, p2Deck, selectedCards, highestValue) => {
  return [8, 9, 10, 11];
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

const validateSelectedCards = (isOdd, selectedCards, currentDeck, previousCardNum,isPower) => {
  let isError = false;
  if (isOdd != null) {
    if (isOdd){
      if (selectedCards.length % 2 == 0) {
        console.log("you can't use even cards on this round");
        return true;
      }
      if((Math.floor(selectedCards.length /3) === 0) && isPower){
        console.log("you must use 3 cards");
        return true;
      }
    }
    else{
      if (selectedCards.length % 2 == 1) {
        console.log("you can't use odd cards on this round");
        return true;
      }
      if((Math.floor(selectedCards.length /3) === 0) && isPower){
        console.log("you must use 4 cards");
        return true;
      }
    }
  }

  let representCardNum = null;  
  let selectedCardsUsed = [];
  selectedCards.forEach(element => {
    let selectedCardNum = Math.floor(element/4);
    if(representCardNum != null && selectedCardNum != representCardNum){
      console.log('you must use same card number for multiple cards');
      isError = true;
      return;
    }
    representCardNum = selectedCardNum;
    if (currentDeck.indexOf(element) === -1) {
      console.log("you don't have the card");
      isError = true;
      return;
    }
    if(previousCardNum != null && selectedCardNum < previousCardNum){
      if(isPower !== true && Math.floor(selectedCards.length/2) == 0){
        console.log("you can't use lower point cards");
        isError = true;
        return;
      }
    }
    if(selectedCardsUsed.indexOf(element) != -1){
      console.log("you can't use same card multiple times")
      isError = true;
      return;
    }
    else{
      selectedCardsUsed.push(element);
    }
  });
  
  return isError;
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
  let previousCardNum = null;
  let isPower = false;
  while (isNotOver) {
    console.log('Your current Card: ');
    newDeck.p1Deck.forEach(element => {
      process.stdout.write(convertNumToCard(element) + ' ');
    });
    console.log();
    if (isOdd == null) {
      console.log('====== NEW ROUND ======');
      previousCardNum = null;
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

    if (!validateSelectedCards(isOdd,selectedCards,newDeck.p1Deck,previousCardNum,isPower)) {
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
      let aiSelectedCards = getAISelectedCards(isOdd, newDeck.p1Deck, newDeck.p2Deck, selectedCards, highestCardNum * 4);
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
          previousCardNum = Math.floor(element/4);
          process.stdout.write(convertNumToCard(element) + ' ');;
          let index = newDeck.p2Deck.indexOf(element);
          newDeck.p2Deck.splice(index, 1);
        });
        console.log();
      }
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