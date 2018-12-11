const max_depth = 3
const currentDeckP1 = [ 4, 5, 6, 7, 8, 9, 12, 15, 16 ]
const currentDeckP2 = [ 0, 1, 3, 10, 11, 13, 14, 17, 18, 19 ]
const p1_selectedCards = [ 2 ]
const p2_selectedCards = [ [0],[1] ]
const highestCardValue = 3
const isOdd = true

const getAISelectedCards = (currentDeckP1, currentDeckP2, p1_selectedCards, highestCardValue, isOdd) => {
    dosomething()
}

const is_win = (state) => {
    if (state.length == 0) {
        return true
    }
    return false
}

const getPossibleCard = (p1SelectedCard,p2SelectedCard,p2Card,isOdd) => {
    var PossibleCardP2 = []
    for(let i = 0; i < p2SelectedCard.length;i++) {
        if(isSelectedCardCanPlay(p1SelectedCard, p2SelectedCard[i]) && (!validateSelectedCards(isOdd, p2SelectedCard[i],p2Card))) {
            PossibleCardP2.push(p2SelectedCard[i])
        }
    }
    return PossibleCardP2
}

const isSelectedCardCanPlay = (p1SelectedCard,p2SelectedCard) => {
    for(let i = 0; i < p1SelectedCard.length;i++) {
        var maxTypeCard
        for(let j = 0; j < p2SelectedCard.length;j++) {
            const checkNumberP1 = parseInt((p1SelectedCard[i] + 4)/4)
            const checkTypeCardP1 = parseInt((p1SelectedCard[i]%4))
            const checkNumberP2 = parseInt((p2SelectedCard[j] + 4)/4)
            const checkTypeCardP2 = parseInt((p2SelectedCard[j]%4))
            if (checkNumberP2 > checkNumberP1) {
                console.log();
            } else if (checkNumberP2 == checkNumberP1){
                if (checkTypeCardP2 < checkTypeCardP1){
                    maxTypeCard = checkTypeCardP2
                } else {
                    if (maxTypeCard < checkTypeCardP1){
                        console.log();
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

const validateSelectedCards = (isOdd, selectedCards, currentDeck) => {
  let isError = false;
  if (isOdd != null) {
    if (isOdd && selectedCards.length % 2 == 0) {
    //   console.log("you can't use even cards on this round");
      return true;
    }
    if (!isOdd && selectedCards.length % 2 == 1) {
    //   console.log("you can't use odd cards on this round");
      return true;
    }
  }
  let representCardNum = null;  
  selectedCards.forEach(element => {
    let selectedCardNum = Math.floor(element/4);
    if(representCardNum != null && selectedCardNum != representCardNum){
      isError = true;
      return;
    }
    representCardNum = selectedCardNum;
    if (currentDeck.indexOf(element) === -1) {
      console.log("you don't have the card");
      isError = true;
      return;
    }
  });
  
  return isError;
}

console.log(getPossibleCard(p1_selectedCards, p2_selectedCards, currentDeckP2, isOdd))