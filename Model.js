const max_depth = 3
const currentDeckP1 = [ 4, 6, 7, 9, 10 ]
const currentDeckP2 = [ 1, 2, 3, 5, 8, 11 ]
const p1_selectedCards = [ 0 ]
const highestCardValue = 3
const isOdd = true

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
    var maxVal  = highestCardValue * 2
    var score = 0
    groupNode.forEach(e =>{
        var number = parseInt((e[0]+4)/4)
        for (let i = 1; i < highestCardValue; i++) {
            if(i == number) {
                if (e.length == 3 || e.length == 4) {
                    score += highestCardValue - i + 1                  
                } else {
                    score += maxVal - i +1
                }
            } 
        }
    })
    return score
}

const min_value_function = (p2_selectedCard,currentDeckP1,currentDeckP2,a,b,level,highestCardValue,isOdd) =>{
    return new Promise((resolve, reject) => {
        if (level >= max_depth) {
            const ret_u = heuristic(currentDeckP2,highestCardValue)
            resolve(ret_u)
        } else {
            // if(currentDeckP2.length == 0) {
            //     resolve(99)
            // }
            const p1_selectedCard = getPossibleCard(p2_selectedCard,SortArray(allExpand(currentDeckP1)),currentDeckP1,isOdd)
            // if (p1_selectedCard.length == 0){
            //     resolve(99) 
            // }
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
            resolve(ret_u)
        } else {
            // if(currentDeckP1.length == 0) {
            //     resolve(-99)
            // }
            const p2_selectedCard = getPossibleCard(p1_selectedCard,SortArray(allExpand(currentDeckP2)),currentDeckP2,isOdd)
            let v = -100
            // if (p2_selectedCard.length == 0){
            //     resolve(-99) 
            // }
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
        if(isSelectedCardCanPlay(p1SelectedCard, p2SelectedCard[i]) && (!validateSelectedCards(isOdd, p2SelectedCard[i],p2Card))) {
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

// Validate Even turn or Odd turn

const validateSelectedCards = (isOdd, selectedCards, currentDeck, previousCardNum,isPower) => {
  let isError = false;
  if (isOdd != null) {
    if (isOdd){
      if (selectedCards.length % 2 == 0) {
        // console.log("you can't use even cards on this round");
        return true;
      }
      if((Math.floor(selectedCards.length /3) === 0) && isPower){
        // console.log("you must use 3 cards");
        return true;
      }
    }
    else{
      if (selectedCards.length % 2 == 1) {
        // console.log("you can't use odd cards on this round");
        return true;
      }
      if((Math.floor(selectedCards.length /3) === 0) && isPower){
        // console.log("you must use 4 cards");
        return true;
      }
    }
  }

  let representCardNum = null;  
  let selectedCardsUsed = [];
  selectedCards.forEach(element => {
    let selectedCardNum = Math.floor(element/4);
    if(representCardNum != null && selectedCardNum != representCardNum){
    //   console.log('you must use same card number for multiple cards');
      isError = true;
      return;
    }
    representCardNum = selectedCardNum;
    if (currentDeck.indexOf(element) === -1) {
    //   console.log("you don't have the card");
      isError = true;
      return;
    }
    if(previousCardNum != null && selectedCardNum < previousCardNum){
      if(isPower !== true && Math.floor(selectedCards.length/2) == 0){
        // console.log("you can't use lower point cards");
        isError = true;
        return;
      }
    }
    if(selectedCardsUsed.indexOf(element) != -1){
      //   console.log("you can't use same card multiple times")
      isError = true;
      return;
    }
    else{
      selectedCardsUsed.push(element);
    }
  });
  
  return isError;
}

getAISelectedCards(true,[ 6, 7, 10, 13, 14, 15 ], [ 1, 2, 3, 5, 8, 11],[],4).then((results)=>{
    console.log('Ai Choose ',results)
})
