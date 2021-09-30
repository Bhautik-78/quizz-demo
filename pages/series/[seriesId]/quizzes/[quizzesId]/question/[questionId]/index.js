import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Head from 'next/dist/next-server/lib/head';
import axios from 'axios';
import AddQuizzes from '../../../../../../../Components/AddQuizzes/AddQuizzes';
import Layout from '../../../../../../../Components/Layout/Layout';

const QuestionId = () => {
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [question, setQuestion] = useState([]);
  const [oneQuestion, setOneQuestion] = useState({});
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.split('/')[4];
    const questionId = window.location.pathname.split('/')[6];
    const getQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`/api/sundae/quizzes/${id}`);
        if (response.data.quiz) {
          const Question = response.data.quiz.questions;
          setQuestion(Question);
          const result = Question.find((item) => item.id === questionId);
          setOneQuestion(result);
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
  }, []);

  return (
    <Layout quizNav flag={flag}>
      <Head>
        <title>Sundae - Question</title>
      </Head>
      <div>
        <AddQuizzes placeFlag question={oneQuestion} setFlag={setFlag} flag={flag} />
      </div>
    </Layout>
  );
};

export default QuestionId;
