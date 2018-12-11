const max_depth = 1
const currentDeckP1 = [ 4, 5, 6, 7, 8, 9, 12, 15, 16 ]
const currentDeckP2 = [ 0, 1, 3, 10, 11, 13, 14, 17, 18, 19 ]
const p1_selectedCards = [ 2 ]
const highestCardValue = 3
const isOdd = true

// Ai Playing Card
const getAISelectedCards = (currentDeckP1, currentDeckP2, p1_selectedCards, highestCardValue, isOdd) => {
    return new Promise((resolve, reject) => {
        var action
        var maxVal = -100
        const a = 5
        const b = -5
        const p2_selectedCard = getPossibleCard(p1_selectedCards,SortArray(allExpand(currentDeckP2)),currentDeckP2,isOdd)

        p2_selectedCard.forEach(element => {
            var currentDeckP2_slice = currentDeckP2.slice();
            element.forEach(e => {
                currentDeckP2_slice.splice(currentDeckP2_slice.indexOf(e),1)
                min_value_function(element,currentDeckP1,currentDeckP2_slice,a,b,0,highestCardValue,isOdd).then((results)=> {
                    if (results > maxVal) {
                        maxVal = results
                        action = element
                        resolve(action)
                    }
                })
            })
        });
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
        }
        const p1_selectedCard = getPossibleCard(p2_selectedCard,SortArray(allExpand(currentDeckP1)),currentDeckP1,isOdd)
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
    })
}

const max_value_function = (p1_selectedCard,currentDeckP1,currentDeckP2,a,b,level,highestCardValue,isOdd)=>{
    return new Promise((resolve, reject) => {
        if (level >= max_depth) {
            const ret_u = heuristic(currentDeckP1,highestCardValue)
            resolve(ret_u)
        }
        const p2_selectedCard = getPossibleCard(p1_selectedCard,SortArray(allExpand(currentDeckP2)),currentDeckP2,isOdd)
        let v = -100
        p2_selectedCard.forEach(element => {
            var currentDeckP2_slice = currentDeckP2.slice();
            element.forEach(e => {
                currentDeckP2_slice.splice(currentDeckP2_slice.indexOf(e),1)
            })
            min_value_function(element,currentDeckP1,currentDeckP2_slice,a,b,level+1,highestCardValue,isOdd).then((results)=>{
                v = Math.max(v,results)
                resolve(v)
            })
        });
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

getAISelectedCards(currentDeckP1,currentDeckP2,p1_selectedCards,highestCardValue,isOdd).then((results)=>{
    console.log(results)
})