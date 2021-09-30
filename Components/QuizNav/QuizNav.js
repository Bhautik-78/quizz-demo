import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Button, Popover, PopoverHeader, PopoverBody, Spinner
} from 'reactstrap';
import { useSession } from 'next-auth/client';
import axios from 'axios';
import Draggable from 'react-draggable';
import styles from './quizNav.module.scss';
import SideNavLoader from '../SideNavLoader';

const QuizNav = (props) => {
  const router = useRouter();
  const { flag } = props;
  const [session, loading] = useSession();
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [question, setQuestion] = useState([]);
  const [result, setResult] = useState([]);
  const [id, setId] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverResultOpen, setPopoverResultOpen] = useState(false);
  const [deleteFlag, setDeleteFlag] = useState(false);
  const [questionId, setQuestionId] = useState('');
  const [resultId, setResultId] = useState('');
  const [deleteQuestionId, setDeleteQuestionId] = useState('');
  const [deleteResultId, setDeleteResultId] = useState('');

  useEffect(() => {
    const seriesId = window.location.pathname.split('/')[2];
    setSeriesId(seriesId);

    const id = window.location.pathname.split('/')[4];
    setId(id);

    let ResultId = '';
    const path = window.location.pathname.split('/');
    if (path[5] === 'result') {
      ResultId = path[6];
    }

    const getQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/sundae/quizzes/${id}`);
        if (response.data.quiz) {
          setQuestion(response.data.quiz.questions);
        } else {
          setServerErr(response.data.errorMessage);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setServerErr('Some server Error');
      }
    };
    const getResult = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/sundae/quizzes/${id}/quizResult`);
        if (response.data.quizResults) {
          setResult(response.data.quizResults);
        } else {
          setServerErr(response.data.errorMessage);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setServerErr('Some server Error');
      }
    };
    getQuiz();
    getResult();
  }, [deleteFlag, flag]);

  if (loading) return '';

  const addQuestion = async () => {
    try {
      setLoading(true);
      const data = {
        questionText: `Question ${question.length + 1}`,
        isSingleAnswer: false,
        position: 1
      };
      const response = await axios.post(`/api/sundae/quizzes/${id}/questions/add`, data);
      if (response.data.question) {
        setQuestion([...question, response.data.question]);
        router.push(`/series/${seriesId}/quizzes/${id}/question/${response.data.question.id}`);
      } else {
        setServerErr(response.data.errorMessage);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setServerErr('Some server Error');
    }
  };

  const onDelete = async (queId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/sundae/quizzes/${id}/questions/${queId}/delete`);
      if (response.data.deleted) {
        setPopoverOpen(!popoverOpen);
        setDeleteFlag(!deleteFlag);
        setLoading(false);
        router.push(`/series/${seriesId}/quizzes/${id}/question`);
      } else {
        setServerErr(response.data.errorMessage);
        setLoading(false);
      }
    } catch {
      setLoading(false);
      setServerErr('Some server Error');
    }
  };

  const onDeleteResult = async (resId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/sundae/quizzes/${id}/quizResult/${resId}/delete`);
      if (response.data.deleted) {
        setPopoverResultOpen(!popoverResultOpen);
        setDeleteFlag(!deleteFlag);
        setLoading(false);
        router.push(`/series/${seriesId}/quizzes/${id}/result`);
      } else {
        setServerErr(response.data.errorMessage);
        setLoading(false);
      }
    } catch {
      setLoading(false);
      setServerErr('Some server Error');
    }
  };

  const onAddResult = async () => {
    try {
      setLoading(true);
      const data = {
        result: `Result ${result.length + 1}`,
        scoreMin: 0,
        scoreMax: 0
      };
      const response = await axios.post(`/api/sundae/quizzes/${id}/quizResult/add`, data);
      if (response.data.addQuizResult) {
        setResult([...result, response.data.addQuizResult]);
        router.push(`/series/${seriesId}/quizzes/${id}/result/${response.data.addQuizResult.id}`);
      } else {
        setServerErr(response.data.errorMessage);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setServerErr('Some server Error');
    }
  };

  const toggle = (id) => {
    setQuestionId(id);
    setPopoverOpen(!popoverOpen);
  };

  const deleteQuestions = (questionId) => {
    setPopoverOpen(true);
    setDeleteQuestionId(questionId);
  };

  const deleteResult = (resultId) => {
    setPopoverResultOpen(true);
    setDeleteResultId(resultId);
  };

  const toggle2 = (id) => {
    setResultId(id);
    setPopoverResultOpen(!popoverResultOpen);
  };

  const links = [
    <Link href={`/series/${seriesId}/quizzes`} key="quizzes">
      <li className="list-group-item">Return</li>
    </Link>,
  ];

  links.push(
    <Link href={`/series/${seriesId}/quizzes/${id}/edit`} key="edit">
      <li className="list-group-item">Edit Quiz</li>
    </Link>
  );

  links.push(
    <Link href={`/series/${seriesId}/quizzes/${id}/question`} key="question">
      <li className="list-group-item">Questions</li>
    </Link>
  );

  question && question.length > 0 && question.map((item, index) => {
    links.push(
        <Draggable
            axis="y"
            handle=".handle"
            defaultPosition={{x: 0, y: 0}}
            position={null}
            grid={[25, 25]}
            scale={1}
            // onStart={handleStart}
            // onDrag={handleDrag}
            // onStop={handleStop}
        >
          <div key={`${question}_${index}`} style={{ position: 'relative' }}>
            <Link href={`/series/${seriesId}/quizzes/${id}/question/${item.id}`} key="question">
              <li style={{ background: '#d9e2e3', display: 'flex', justifyContent:'space-between' }} className="list-group-item">
                <div style={{ display: 'inherit', width: '80%' }}>
                  <img height={25} src="/Assets/outline_chat_black_24dp.png" alt="addIcon" />
                  <div className={styles.question_text}>
                    {item.questionText}
                  </div>
                </div>
                <div style={{ display: 'inherit' }}>
                  <img
                      id={item.id}
                      onClick={() => deleteQuestions(item.id)}
                      className={styles.question_img}
                      height={25}
                      src="/Assets/trash.svg"
                      alt="Delete"
                  />
                </div>
              </li>
            </Link>
          </div>
        </Draggable>
    );
  });

  links.push(
    <li onClick={addQuestion} className="list-group-item">
      <img
        height={25}
        src="/Assets/add_plus.png"
        alt="addIcon"
      />
      {' '}
      Add Question
    </li>
  );

  links.push(
    <li onClick={onAddResult} className="list-group-item">
      <img
        height={25}
        src="/Assets/add_plus.png"
        alt="addIcon"
      />
      {' '}
      Results
    </li>
  );

  result && result.length > 0 && result.map((item, index) => {
    links.push(
      <div key={`${result}_${index}`} style={{ position: 'relative' }}>
        <Link href={`/series/${seriesId}/quizzes/${id}/result/${item.id}`} key="result">
          <li style={{ background: '#d9e2e3', display: 'flex', justifyContent:'space-between' }} className="list-group-item">
            <div style={{ display: 'inherit', width: '60%' }}>
              <img height={25} src="/Assets/outline_flag_black_24dp.png" alt="addIcon" />
              <div className={styles.result_question}>
                {item.result}
              </div>
            </div>
            <div style={{ display: 'inherit' }}>
              <div className={styles.result_score}>{`${item.scoreMin} to ${item.scoreMax}`}</div>
              <img
                id={item.id}
                onClick={() => deleteResult(item.id)}
                className={styles.result_img}
                height={25}
                src="/Assets/trash.svg"
                alt="Delete"
              />
            </div>
          </li>
        </Link>
      </div>
    );
  });

  return (
    <div className={styles.sidenav_container}>
      <ul className="list-group list-group-flush">
        {
                        isLoading ? <SideNavLoader /> : links
                    }
      </ul>
      {
                isLoading ? <SideNavLoader />
                  : popoverOpen && (
                  <Popover
                    placement="bottom-end"
                    isOpen={popoverOpen}
                    toggle={() => toggle(deleteQuestionId)}
                    target={deleteQuestionId}
                  >
                    <PopoverHeader>Are You Sure Delete This Question?</PopoverHeader>
                    <PopoverBody>
                      <Button onClick={() => onDelete(deleteQuestionId)} type="button">Delete</Button>
                      <Button
                        onClick={() => setPopoverOpen(!popoverOpen)}
                        style={{ marginLeft: '2px' }}
                        type="button"
                      >
                        Cancel
                      </Button>
                    </PopoverBody>
                  </Popover>
                  )
            }
      {
                isLoading ? <SideNavLoader />
                  : popoverResultOpen && (
                  <Popover
                    placement="bottom-end"
                    isOpen={popoverResultOpen}
                    toggle={() => toggle2(deleteResultId)}
                    target={deleteResultId}
                  >
                    <PopoverHeader>Are You Sure Delete This Result?</PopoverHeader>
                    <PopoverBody>
                      <Button onClick={() => onDeleteResult(deleteResultId)} type="button">Delete</Button>
                      <Button
                        onClick={() => setPopoverResultOpen(!popoverResultOpen)}
                        style={{ marginLeft: '2px' }}
                        type="button"
                      >
                        Cancel
                      </Button>
                    </PopoverBody>
                  </Popover>
                  )
            }
    </div>
  );
};

export default QuizNav;
