import { Header } from './Components/Header.jsx';
import { Bod } from './Components/Bod.jsx';
import { useEffect, useReducer } from 'react';
import { Loader } from './Components/Loader.jsx';
import { Error } from './Components/Error.jsx';
import { StartScreen } from './Components/StartScreen.jsx';
import { Question } from './Components/Question.jsx';
import { NextButton } from './Components/NextButton.jsx';
import { Progress } from './Components/Progress.jsx';
import { FinishedScreen } from './Components/FinishedScreen.jsx';
import { Footer } from './Components/Footer.jsx';
import { Timer } from './Components/Timer.jsx';

const SECS_PER_QUESTION = 15;

const initialState = {
  questions: [],
  // 'loading','error','ready','active','finished'
  theStatus: 'loading',
  index: 0,
  answer: null,
  points: 0,
  highScore: 0,
  secondsRemaining: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'dataReceived':
      return {
        ...state,
        questions: action.payload,
        theStatus: 'ready'
      };
    case 'dataFailed':
      return {
        ...state,
        theStatus: 'error'
      };
    case 'start':
      return {
        ...state,
        theStatus: 'active',
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case 'newAnswer':
      const question = state.questions.at(state.index)
      return {
        ...state,
        answer: action.payload,
        points: action.payload === question.correctOption ? state.points + question.points : state.points,
      };
    case 'nextQuestion':
      return {
        ...state,
        index: state.index + 1,
        answer: null,
      };
    case 'finish':
      return {
        ...state,
        theStatus: 'finished',
        highScore: state.points > state.highScore ? state.points : state.highScore,
      };
    case 'restart':
      return {
        ...initialState,
        questions: state.questions,
        theStatus: 'ready',
        highScore: state.highScore,
      };
    case 'tick':
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        theStatus: state.secondsRemaining === 0 ? 'finished' : state.theStatus,
        
      };
    default:
      throw new Error("Unknown Action");
  }
}

export default function App() {

  const [state, dispatch] = useReducer(reducer, initialState);

  const { questions, theStatus, index, answer, points, highScore, secondsRemaining } = state;

  const maxPossiblePoints = questions.reduce((prev, curr) => prev + curr.points, 0)
  useEffect(() => {
    fetch("http://localhost:3000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: 'dataReceived', payload: data }))
      .catch((err) => dispatch({ type: 'dataFailed' }))
  }, [])

  return (
    <div className='app'>
      <Header></Header>
      <Bod>
        {theStatus === 'loading' && <Loader />}
        {theStatus === 'error' && <Error />}
        {theStatus === 'ready' && (<StartScreen numQuestions={questions.length} dispatch={dispatch} />)}
        {theStatus === 'active' && (
          <>
            <Progress index={index} numQuestions={questions.length} points={points} maxPossiblePoints={maxPossiblePoints} answer={answer} ></Progress>
            <Question question={questions[index]} dispatch={dispatch} answer={answer} />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining}></Timer>
              <NextButton dispatch={dispatch} answer={answer} index={index} numQuestions={questions.length} />
            </Footer>
          </>)}

        {theStatus === 'finished' && (
          <FinishedScreen points={points} maxPossiblePoints={maxPossiblePoints} highScore={highScore} dispatch={dispatch} />
        )}
      </Bod>
    </div>
  )
}