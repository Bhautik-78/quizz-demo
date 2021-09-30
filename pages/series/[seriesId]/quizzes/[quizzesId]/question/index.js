import React, { useState, useEffect } from 'react';
import Head from 'next/dist/next-server/lib/head';
import axios from 'axios';
import Layout from '../../../../../../Components/Layout/Layout';
import AddQuizzes from '../../../../../../Components/AddQuizzes/AddQuizzes';

const Question = () => {
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [question, setQuestion] = useState([]);
  const [id, setId] = useState('');
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.split('/')[4];
    setId(id);
    const getQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/sundae/quizzes/${id}`);
        if (response.data.quiz) {
          const quiz = response.data.quiz.questions;
          if (quiz.length > 0) {
            setQuestion(response.data.quiz.questions);
          } else {
            createQuestion();
          }
        } else {
          setServerErr(response.data.errorMessage);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setServerErr('Some server Error');
      }
    };
    const createQuestion = async () => {
      try {
        setLoading(true);
        const data = {
          questionText: `Question ${question.length + 1}`,
          isSingleAnswer: false,
          position: 1
        };
        const response = await axios.post(`/api/sundae/quizzes/${id}/questions/add`, data);
        if (response.data.question) {
          setFlag(!flag);
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
  }, [flag]);

  return (
    <Layout quizNav question={question} id={id} flag={flag}>
      <Head>
        <title>Sundae - Question</title>
      </Head>
      <div>
        <AddQuizzes question={question} setFlag={setFlag} flag={flag} />
      </div>
    </Layout>
  );
};

export default Question;
