import {useRouter} from 'next/router';
import React, {useState, useEffect} from 'react';
import {
    Card, CardBody, ModalHeader, Table, ModalBody, ModalFooter, Button, Modal, Input, Spinner
} from 'reactstrap';
import axios from 'axios';
import styles from './AddQuizzes.module.scss';
import CardLoader from '../CardLoader';

const AddQuizzes = (props) => {
    const {flag, setFlag} = props;
    const router = useRouter();
    const [id, setId] = useState({
        QuizId: '',
        QuestionId: ''
    });
    const [isOpen, setOpen] = useState(false);
    const [quizzes, setQuizzes] = useState({});
    const [question, setQuestion] = useState({});
    const [localOption, setLocalOption] = useState([]);
    const [answer, setAnswer] = useState([{value: '', score: 0, optionId: ''}, {value: '', score: 0, optionId: ''}]);
    const [dummyAnswer, setDummyAnswer] = useState([]);
    const [serverErr, setServerErr] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [multiAns, setMultiAns] = useState(false);
    const [deleteFlag, setDeleteFlag] = useState(false);
    const [defaultFlag, setDefaultFlag] = useState(false);
    const [changes, setChanges] = useState('');
    const [optionError, setOptionError] = useState('');
    const [questionError, setQuestionError] = useState('');
    const [height, setHeight] = useState('48px');

    useEffect(() => {
        let QuizId = '';
        let QuestionId = '';
        const id = window.location.pathname.split('/');
        if (id.length === 7) {
            QuizId = id[4];
            QuestionId = id[6];
        } else {
            QuizId = id[4];
            QuestionId = props && props.question[0] && props.question[0].id || '';
        }
        setId({QuizId, QuestionId});
        const getQuestion = async () => {
            try {
                setLoading(true);
                if (QuestionId === '') {
                    const response = await axios.get(`/api/sundae/quizzes/${QuizId}`);
                    if (response.data.quiz) {
                        QuestionId = response.data.quiz.questions[0].id;
                        setId({QuestionId});
                    }
                }
                const response = await axios.get(`/api/sundae/quizzes/${QuizId}/questions/${QuestionId}`);
                if (response && response.data && response.data.question) {
                    const f = (response.data.question.questionText).split(' ');
                    const d = !isNaN(f[1]);
                    !d ? (setQuizzes({
                        ...quizzes,
                        question: response.data.question.questionText
                    })) : (setQuizzes({...quizzes, question: ''}));
                    setQuestion(response.data.question);
                    const option = response && response.data && response.data.question.options;
                    const result = [];
                    answer.forEach((item, index) => {
                        option.forEach((x, i) => {
                            if (index === i && x.optionText === item.value) {
                                result.push(item);
                            }
                        });
                    });
                    const modifyAnswer = result;
                    if (option.length > 0) {
                        for (const [index, item] of option.entries()) {
                            modifyAnswer[index] = {
                                ...item,
                                value: item.optionText,
                                score: item.score,
                                optionId: item.id
                            };
                        }
                        const d = localOption.concat(JSON.parse(JSON.stringify(modifyAnswer)));
                        setAnswer(d);
                        const f = localOption.concat(option);
                        setDummyAnswer(f);
                    } else {
                        setAnswer([{value: '', score: 0, optionId: ''}, {value: '', score: 0, optionId: ''}]);
                        setDummyAnswer([{value: '', score: 0, optionId: ''}, {value: '', score: 0, optionId: ''}])
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
        getQuestion();
    }, [router.asPath, deleteFlag, defaultFlag, flag, localOption]);

    useEffect(() => {
        const tx = document.getElementsByTagName('textarea');
        for (let i = 0; i < tx.length; i++) {
            if (tx[i].value === '') {
                tx[i].setAttribute('style', `height:${{height}};overflow-y:hidden;`);
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

    const handelCheckboxChange = (e) => {
        const {checked} = e.target;
        setMultiAns(checked);
    };

    const onQuestionChange = (e) => {
        const {name, value} = e.target;
        if (name === 'question') {
            if (value !== question.questionText) {
                setChanges('There New Changes');
            } else {
                setChanges('');
            }
        }
        const quizzes1 = JSON.parse(JSON.stringify(quizzes));
        setQuizzes({...quizzes1, [name]: value});
    };

    const onAnswerChange = (e, i) => {
        const {name, value} = e.target;
        answer[i].value = value;
        setAnswer([...answer]);
    };

    const inputOnChange = (e, i) => {
        const {name, value} = e.target;
        answer[i].score = parseInt(value);
        setAnswer([...answer]);
    };

    const onAdd = () => {
        answer.push({value: '', score: 0, optionId: ''});
        dummyAnswer.push({value: '', score: 0, optionId: ''});
        setAnswer([...answer]);
        setDummyAnswer([...dummyAnswer]);
    };

    const onUpdateAns = async () => {
        if (!(question.questionText === quizzes.question)) {
            if (quizzes.question === "") {
                setQuestionError("Your Question Text Field Is Blank")
            } else {
                setQuestionError("");
                const questionText = quizzes.question ? quizzes.question : question.questionText;
                const data = {
                    questionText,
                };
                setLoading(true);
                const response = await axios.post(`/api/sundae/quizzes/${id.QuizId}/questions/${id.QuestionId}/edit`, data);
                if (response.status === 200) {
                    setDefaultFlag(true);
                    setFlag(!flag);
                    setChanges('');
                } else {
                    setServerErr(response.data.errorMessage);
                }
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
        const result = [];
        if (dummyAnswer.length > 0) {
            answer.forEach((item, index) => {
                dummyAnswer.forEach((x, i) => {
                    if (index === i && x.optionText !== item.value) {
                        result.push(item);
                    }
                });
            });
        } else {
            result.push(...answer);
        }
        if (result.length) {
            if (result.some(value => value.value === "")) {
                setOptionError(`option is empty`)
            } else {
                result.map(async (item, index) => {
                    setLoading(true);
                    setOptionError("");
                    if (item.optionId === '') {
                        const data1 = {
                            optionText: item.value,
                            score: 0,
                            position: index + 1
                        };
                        const response1 = await axios.post(`/api/sundae/quizzes/${id.QuizId}/questions/${id.QuestionId}/options/add`, data1);
                        if (response1 && response1.data && response1.data.option) {
                            setDeleteFlag(!deleteFlag);
                            setLocalOption([]);
                        } else {
                            setServerErr(response1.data.errorMessage);
                        }
                        setLoading(false);
                    } else {
                        const data1 = {
                            optionText: item.value,
                            position: index + 1
                        };
                        const response = await axios.post(`/api/sundae/quizzes/${id.QuizId}/questions/${id.QuestionId}/options/${item.optionId}/edit`, data1);
                        if (response && response.status === 200) {
                            setLoading(false);
                            setDeleteFlag(!deleteFlag);
                            setLocalOption([]);
                        } else {
                            setServerErr(response.data.errorMessage);
                            setLoading(false);
                        }
                    }
                })
            }
        } else {
            setLoading(false);
        }
    };

    const decrement = (index) => {
        if (answer[index].score === 0) {
            answer[index].score = 0;
            setAnswer([...answer]);
        } else {
            answer[index].score = answer[index].score - 1;
            setAnswer([...answer]);
        }
    };

    const increment = (index) => {
        answer[index].score = answer[index].score + 1;
        setAnswer([...answer]);
    };

    const onDeleteOption = async (option) => {
        try {
            if (option.id) {
                setLoading(true);
                const response = await axios.delete(`/api/sundae/quizzes/${id.QuizId}/questions/${id.QuestionId}/options/${option.id}/delete`);
                if (response.data.deleted) {
                    setLoading(false);
                    const d = answer.filter((item) => item.optionId === '');
                    setLocalOption(d);
                    setDeleteFlag(!deleteFlag);
                } else {
                    setServerErr(response.data.errorMessage);
                    setLoading(false);
                }
            } else {
                answer.splice(-1);
                setAnswer([...answer]);
            }
        } catch (e) {
            setLoading(false);
            setServerErr('Some server Error');
        }
    };

    const onSave = async () => {
        try {
            if (!(question.questionText === quizzes.question)) {
                if (quizzes.question === "") {
                    setQuestionError("Your Question Text Field Is Blank")
                } else {
                    setQuestionError("")
                    const score = {score: 0};
                    answer.forEach((item) => {
                        score.score += item.score;
                    });
                    const questionText = quizzes.question ? quizzes.question : question.questionText;
                    const data = {
                        questionText,
                        isSingleAnswer: multiAns,
                        position: 1
                    };
                    setLoading(true);
                    const response = await axios.post(`/api/sundae/quizzes/${id.QuizId}/questions/${id.QuestionId}/edit`, data);
                    if (response.status === 200) {
                        setOpen(false);
                        setDefaultFlag(true);
                        setFlag(!flag);
                        setChanges('');
                    } else {
                        setServerErr(response.data.errorMessage);
                    }
                }
            }else {
                setLoading(false);
            }
            const modifyAnswer = answer;
            if (answer.some(value => value.value === "")) {
                setOptionError(`option is empty`)
                setOpen(false)
            } else {
                answer.map(async (item, index) => {
                    setOptionError("");
                    if (item.optionId === '') {
                        const data1 = {
                            optionText: item.value,
                            score: item.score,
                            position: index + 1
                        };
                        const response1 = await axios.post(`/api/sundae/quizzes/${id.QuizId}/questions/${id.QuestionId}/options/add`, data1);
                        if (response1 && response1.data && response1.data.option) {
                            const {option} = response1.data;
                            modifyAnswer[index] = {
                                ...item,
                                value: option.optionText,
                                score: option.score,
                                optionId: option.id
                            };
                            setDeleteFlag(!deleteFlag);
                        } else {
                            setServerErr(response1.data.errorMessage);
                        }
                        setLoading(false);
                    } else {
                        const result = [];
                        dummyAnswer.forEach((x, i) => {
                            if (index === i && (x.optionText !== item.value || x.score !== item.score)) {
                                result.push(item);
                            }
                        });
                        if (result.length > 0) {
                            for (const i of result) {
                                const data1 = {
                                    optionText: i.value,
                                    score: i.score,
                                    position: index + 1
                                };
                                const response = await axios.post(`/api/sundae/quizzes/${id.QuizId}/questions/${id.QuestionId}/options/${i.optionId}/edit`, data1);
                                if (response && response.status === 200) {
                                    setLoading(false);
                                    setDeleteFlag(!deleteFlag);
                                } else {
                                    setServerErr(response.data.errorMessage);
                                }
                            }
                        }
                    }
                    setAnswer(JSON.parse(JSON.stringify(modifyAnswer)));
                    setOpen(false)
                    setLoading(false);
                })
            }
        } catch (e) {
            setLoading(false);
            setServerErr('Some server Error');
        }
    };

    return (
        <div className={styles.main_container}>
            {
                isLoading ? <CardLoader/>
                    : (
                        <div>
                            <div>
                                <Card className={styles.add_quiz}>
                                    <div className="container-fluid" style={{width: '90%'}}>
                                        <div style={{height: '100%'}}>
                              <textarea
                                  onInputCapture={onQuestionChange}
                                  style={{height}}
                                  placeholder="Question "
                                  className={styles.input}
                                  name="question"
                                  id="question"
                                  value={(quizzes && quizzes.question)}
                                  onChange={onQuestionChange}
                              />
                                            <span
                                                style={{color: 'green'}}
                                            >
                                {!isNaN(question && question.questionText && question.questionText.split(' ')[1]) ? '' : changes}
                              </span>
                                            <span style={{color: 'green'}}>{questionError}</span>
                                            <div className={styles.card_container}>
                                                <Card className={styles.card_body}>
                                                    <CardBody>
                                                        {
                                                            answer && answer.map((item, i) => (
                                                                <div key={`${answer}_${i}`} className={styles.input_icon}>
                                                                    <input
                                                                        placeholder={`Answer ${i + 1}`}
                                                                        className={styles.card_input}
                                                                        name={i}
                                                                        value={item.value}
                                                                        onChange={(e) => onAnswerChange(e, i)}
                                                                    />
                                                                    <div key={`${answer}_${i}`}>
                                                                        {
                                                                            answer.length > 2
                                                                                ? (
                                                                                    <span className={styles.card_icon}>
                                                                                <img
                                                                                    onClick={() => onDeleteOption(item)}
                                                                                    height={20}
                                                                                    width={20}
                                                                                    src="/Assets/trash.png"
                                                                                    alt=" "
                                                                                />
                                                                                </span>
                                                                                )
                                                                                : ''
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                        <br/>
                                                        <div className={styles.add_button_container}>
                                                            <button
                                                                className={styles.add_button}
                                                                style={{marginRight: '10px'}}
                                                                onClick={onAdd}
                                                            >
                                                                Add Option
                                                            </button>
                                                            <button
                                                                className={styles.add_button}
                                                                style={{marginLeft: '10px'}}
                                                                onClick={onUpdateAns}
                                                            >
                                                                {question && question.options && question.options.length ? 'Update Option' : 'Save option'}
                                                            </button>
                                                        </div>
                                                        <span style={{color: "green"}}>{optionError}</span>
                                                    </CardBody>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <button className={styles.score_button} onClick={() => setOpen(true)}>Set Answer Score</button>
                            <Modal
                                contentClassName="score_model"
                                style={{position: 'absolute', right: 0}}
                                isOpen={isOpen}
                                toggle={() => setOpen(false)}
                            >
                                <ModalHeader>
                                    Set Answer Score
                                </ModalHeader>
                                <ModalBody>
                                    <div style={{marginLeft: '20px'}}>
                                        <Input
                                            // checked={question ? question.isSingleAnswer : multiAns}
                                            type="checkbox"
                                            onChange={(e) => handelCheckboxChange(e)}
                                        />
                                        <p>Enable Select Multiple Answers</p>
                                    </div>
                                    <Table className={styles.table} striped>
                                        <thead>
                                        <tr>
                                            <th>Answer</th>
                                            <th>Score</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            answer && answer.map((item, answerIndex) => (
                                                <tr key={`${answer}_${answerIndex}`}>
                                                    <td className={styles.table_td}>{item.value || `Answer ${answerIndex}`}</td>
                                                    <td className={styles.table_input}>
                                                        <input
                                                            type="number"
                                                            value={answer[answerIndex].score || 0}
                                                            onChange={(e) => inputOnChange(e, answerIndex)}
                                                        />
                                                        <img
                                                            onClick={() => decrement(answerIndex)}
                                                            height={25}
                                                            src="/Assets/outline_remove_circle_black_24dp.png"
                                                            alt="addIcon"
                                                        />
                                                        <img
                                                            onClick={() => increment(answerIndex)}
                                                            height={25}
                                                            src="/Assets/outline_add_circle_black_24dp.png"
                                                            alt="addIcon"
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        </tbody>
                                    </Table>
                                    <div className="alert alert-info">
                                        <div className="icon">
                                            <i className="far fa-lightbulb fa-fw" aria-hidden="true"/>
                                        </div>
                                        <span>
                              <strong>Help Tip: </strong>
                              When this section is closed, your result score ranges will be automatically adjusted to ensure that all of your scores are included. If you need to adjust your result score ranges, wait until you have set up all answer scores and then adjust the result score ranges.
                            </span>
                                    </div>
                                </ModalBody>
                                <ModalFooter className={styles.footer}>
                                    <Button
                                        className={styles.save_button}
                                        color="primary"
                                        onClick={onSave}
                                    >
                                        Save
                                    </Button>
                                    {' '}
                                    <Button
                                        className={styles.cancel_button}
                                        color="secondary"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                </ModalFooter>
                            </Modal>
                        </div>
                    )
            }
        </div>
    );
};

export default AddQuizzes;
