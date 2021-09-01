const Symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg', // ??
    'https://image.flaticon.com/icons/svg/105/105220.svg', // ??
    'https://image.flaticon.com/icons/svg/105/105212.svg', // ??
    'https://image.flaticon.com/icons/svg/105/105219.svg' // ??
]

const GAME_STATE = {
    FirstCardAwaits: "FirstCardAwaits",
    SecondCardAwaits: "SecondCardAwaits",
    CardsMatchFailed: "CardsMatchFailed",
    CardsMatched: "CardsMatched",
    GameFinished: "GameFinished",
}


const model = {
    revealedCards: [],
    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
    },
    score: 0,
    triedTimes: 0                        
}

const view = {
    displayCards(cardsArray){
        const rootElement = document.querySelector('#cards')
        // rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join('')
        rootElement.innerHTML = cardsArray.map(index => this.getCardElement(index)).join('')
        // console.log(innerHTML)
        // rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index))
    },
    getCardElement(index){
        return `<div data-index="${index}" class="card back"></div>`
    },
    getCardContent(index){
        const number = this.transforNumber((index%13) + 1)
        const symbol = Symbols[Math.floor(index / 13)]
        return `
            <p>${number}</p>
            <img src="${symbol}" alt="">
            <p>${number}</p>
        `
    },
    flipCards(...cards){
        // console.log(cards)
        cards.map(card => {
            // console.log(card)
            if (card.classList.contains('back')){
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(Number(card.dataset.index))
                return
            }
            card.classList.add('back')
            card.innerHTML = null
        })
    },
    pairCards(...cards){
        cards.map(card => {
            card.classList.add('paired')
        })
        
    },
    transforNumber(number){
        switch (number){
            case 1:
                return 'A'
            case 11:
                return 'J'
            case 12:
                return 'Q'
            case 13:
                return 'K'
            default:
                return number    
        }
    },
    renderScore(score){
        document.querySelector(".score").innerHTML = `Score: ${score}`
    },
    renderTriedTimes(times){
        document.querySelector(".tried").innerHTML = `You've tried: ${times} times`
    },
    appendWrongAnimation(...cards){
        cards.map(card => {
            card.classList.add('wrong')
            card.addEventListener('animationend', event =>{event.target.classList.remove('wrong'),{once: true}})
        })
    },
    showGameFinished () {
        const div = document.createElement('div')
        div.classList.add('completed')
        div.innerHTML = `
          <p>Complete!</p>
          <p>Score: ${model.score}</p>
          <p>You've tried: ${model.triedTimes} times</p>
        `
        const header = document.querySelector('#header')
        header.before(div)
      }
}

const controller = {
    currentState: GAME_STATE.FirstCardAwaits,
    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },
    dispatchCardAction(card){
        if (!card.classList.contains('back')){
            return
        }
        switch (this.currentState){
            case GAME_STATE.FirstCardAwaits:
                view.renderTriedTimes(++model.triedTimes)
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                if (model.isRevealedCardsMatched()){
                    view.renderScore(model.score += 10)
                    this.currentState = GAME_STATE.CardsMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []
                    if (model.score === 10) {
                        console.log('showGameFinished')
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished()
                        return
                    }
                    this.currentState = GAME_STATE.FirstCardAwaits
                }
                else{
                    this.currentState = GAME_STATE.CardsMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(this.resetCards, 1000)
                }
                break
        }
        console.log('this.currentState', this.currentState)
        // model.revealedCards.forEach(card => {console.log(card)})
    },
    resetCards(){
        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwaits
    }
}


const utility = {
    getRandomNumberArray(count){
        const number = Array.from(Array(count).keys())
        for (let index = number.length-1 ; index > 0; index--){
            let randomIndex = Math.floor(Math.random() * (index + 1));
            [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    }
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card =>{
    card.addEventListener('click', event =>{
        // console.log(card)
        controller.dispatchCardAction(card)
    })
})