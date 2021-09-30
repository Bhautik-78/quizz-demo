import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import axios from 'axios';

const Series = () => {
  const router = useRouter();
  const [session, loading] = useSession();
  const [series, setSeries] = useState(null);
  const [isOpen, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isPublished, setPublished] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [clientErr, setClientErr] = useState({
    name: '',
    coverImg: '',
  });

  useEffect(() => {
    console.log(session, 'yoooo');
    const getTestQuiz = async () => {
      try {
        const input = [
          {
            questionId: 1,
            score: 1,
            optionsIds: ['3_ckt2rh58s44883mpsf8uxixhy']
          },
          {
            questionId: 2,
            score: 1,
            optionsIds: ['6_ckt2rh58s44883mpsf8uxixhy']
          },
          {
            questionId: 3,
            score: 1,
            optionsIds: ['13_ckt2rh58s44883mpsf8uxixhy']
          },
          {
            questionId: 4,
            score: 1,
            optionsIds: ['16_ckt2rh58s44883mpsf8uxixhy', '17_ckt2rh58s44883mpsf8uxixhy']
          },
          {
            questionId: 5,
            score: 1,
            optionsIds: ['21_ckt2rh58s44883mpsf8uxixhy']
          },
          {
            questionId: 6,
            score: 1,
            optionsIds: ['26_ckt2rh58s44883mpsf8uxixhy']
          },
        ];

        const data = {
          questions: input,
        };
        const response = await axios.post('/api/sundae/quizzes/ckt2rh58s44883mpsf8uxixhy/sendAnswer', data);
        console.log(response.data, 'fetched data success');
      } catch (e) {
        console.log(`slt c ici le catch error: ${JSON.stringify(e)}`);
        setServerErr('Some server Error');
      }
    };
    getTestQuiz();
  }, [session]);

  return null;
};

export default Series;
