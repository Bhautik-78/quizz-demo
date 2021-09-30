import React, { useEffect, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from './resultCard.module.scss';
import CardLoader from '../CardLoader';

const ResultCard = (props) => {
  const router = useRouter();
  const { flag, setFlag } = props;
  const [id, setId] = useState([{
    quizId: '',
    resultId: '',
    seriesId : ''
  }]);
  const [isLoading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState(null);
  const [result, setResult] = useState({});
  const [resultText, setResultText] = useState('');
  const [defaultFlag, setDefaultFlag] = useState(false);
  const [scoreError, setScoreError] = useState('');
  const [scorePosError, setScorePosError] = useState('');
  const [changes, setChanges] = useState('');
  const [resultTextError, setResultTextError] = useState('');
  const [resultScoreMinError, setResultScoreMinError] = useState('');
  const [resultScoreMaxError, setResultScoreMaxError] = useState('');
  const [height, setHeight] = useState('48px');

  useEffect(() => {
    const seriesId = window.location.pathname.split('/')[2];
    const quizId = window.location.pathname.split('/')[4];
    const resultId = window.location.pathname.split('/')[6];
    setId({ quizId, resultId, seriesId });
    const getResult = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/sundae/quizzes/${quizId}/quizResult/${resultId}`);
        if (response.data.quizResult) {
          const f = (response.data.quizResult.result).split(' ');
          const d = !isNaN(f[1]);
          !d ? setResult(response.data.quizResult) : setResult({
            ...result,
            result: '',
            scoreMin: response.data.quizResult.scoreMin,
            scoreMax: response.data.quizResult.scoreMax
          });
          setResultText(response.data.quizResult.result);
        } else {
          setServerErr(response.data.errorMessage);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setServerErr('Some server Error');
      }
    };
    getResult();
  }, [router.asPath, defaultFlag]);

  useEffect(() => {
    const tx = document.getElementsByTagName('textarea');
    for (let i = 0; i < tx.length; i++) {
      if (tx[i].value === '') {
        tx[i].setAttribute('style', `height:${{ height }};overflow-y:hidden;`);
      } else {
        tx[i].setAttribute('style', `height:${tx[i].scrollHeight}px;overflow-y:hidden;`);
      }
      tx[i].addEventListener('input', OnInput, false);
    }

    function OnInput() {
      this.style.height = 'auto';
      this.style.height = `${this.scrollHeight}px`;
      setHeight(`${this.scrollHeight}px`);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const regex = /^\d*[1-9]\d*$/
      if (name === 'result') {
        if (value !== resultText) {
          setChanges('There New Changes');
        } else {
          setChanges('');
        }
      }
      if(name === 'scoreMin' || "scoreMax") {
        if (regex.test(value)) {
          setScorePosError("");
          const result1 = JSON.parse(JSON.stringify(result));
          setResult({ ...result1, [name]: value });
        } else {
          setScorePosError('Only Positive Number Valid')
        }
      }
  };

  const onEdit = async () => {
    try {
      if(result.result === ""){
        setResultTextError("Your Result Text Field Is Blank")
      }else if (result.scoreMin === ""){
        setResultScoreMinError("ScoreMin Field Is Blank")
      }else if(result.scoreMax === ""){
        setResultScoreMaxError("ScoreMax Field Is Blank")
      } else {
        setResultTextError("");
        setResultScoreMinError("");
        setResultScoreMaxError("");
        const data = {
          result: result.result,
          scoreMin: result.scoreMin,
          scoreMax: result.scoreMax
        };
        if (Number(result && result.scoreMax) > Number(result && result.scoreMin)) {
          setLoading(true);
          const response = await axios.post(`/api/sundae/quizzes/${id.quizId}/quizResult/${id.resultId}/edit`, data);
          if (response.data.updateQuizResult) {
            setResult(response.data.updateQuizResult);
            setDefaultFlag(true);
            setFlag(!flag);
            setScoreError('');
            setChanges('');
          } else {
            setServerErr(response.data.errorMessage);
            setLoading(false);
          }
          setLoading(false);
        } else {
          setScoreError('Score max is less than to Score min');
          return true;
        }
      }
    } catch (e) {
      setScoreError('');
      setLoading(false);
      setServerErr('Some server Error');
    }
  };

  return (
    <div className={styles.main_container}>
      <div>
        {
          isLoading ? <CardLoader />
            : (
              <Card className={styles.add_quiz}>
                <div className="container-fluid" style={{ width: '90%' }}>
                  <div style={{ height: '100%' }}>
                    <div>
                      <textarea
                        style={{ height }}
                        id="question"
                        onInputCapture={handleChange}
                        onChange={handleChange}
                        name="result"
                        placeholder="result"
                        value={result && result.result}
                        className={styles.input}
                      />
                      <span
                        style={{ color: 'green' }}
                      >
                        {!isNaN(resultText && resultText.split(' ')[1]) ? '' : changes}
                      </span>
                      <span style={{ color: 'green' }}>{resultTextError}</span>
                      <div className={styles.card_container}>
                        <Card className={styles.card_body}>
                          <CardBody>
                            <input
                                        type="number"
                                        onChange={handleChange}
                                        name="scoreMin"
                                        placeholder="Score min"
                                        value={result && result.scoreMin === 0 ? null : result && result.scoreMin}
                                        className={styles.input}
                                      />
                            <input
                                        type="number"
                                        onChange={handleChange}
                                        name="scoreMax"
                                        placeholder="Score max"
                                        value={result && result.scoreMax === 0 ? null : result && result.scoreMax}
                                        className={styles.input}
                                      />
                            <span style={{ color: 'red' }}>{scoreError}</span>
                            <span style={{ color: 'red' }}>{scorePosError}</span>
                            <span style={{ color: 'red' }}>{resultScoreMaxError}</span>
                            <span style={{ color: 'red' }}>{resultScoreMinError}</span>
                            <br />
                            <div className={styles.add_button_container}>
                                        <button
                                          onClick={onEdit}
                                          className={styles.add_button}
                                        >
                                          {((result.scoreMin && result.scoreMax) === 0) ? 'Save Result' : 'Edit Result'}
                                        </button>
                                      </div>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
                }
      </div>
    </div>
  );
};

export default ResultCard;
