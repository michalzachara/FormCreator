import Test from '../models/test.model.js';
import Question from '../models/question.model.js';

export const addQuestion = async (req, res) => {
  const { id } = req.params;
  const { questionText, media = [], answers, correctAnswers, order = 0 } = req.body;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid test ID format' });
    }

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (test.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!questionText || !answers || !correctAnswers || correctAnswers.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newQuestion = await Question.create({
      testId: test._id,
      questionText,
      media,
      answers,
      correctAnswers,
      order
    });

    return res.status(201).json(newQuestion);

  } catch (err) {
    console.error('Error adding question:', err);
    return res.status(500).json({ message: 'Failed to add question' });
  }
};

export const editQuestion = async (req, res) => {
  const { id } = req.params; 
  const { questionText, media = [], answers, correctAnswers, order = 0 } = req.body;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid question ID format' });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const test = await Test.findById(question.testId);
    if (!test) {
      return res.status(404).json({ message: 'Associated test not found' });
    }

    if (test.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!questionText || !answers || !correctAnswers || correctAnswers.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    question.questionText = questionText;
    question.media = media;
    question.answers = answers;
    question.correctAnswers = correctAnswers;
    question.order = order;

    const updatedQuestion = await question.save();

    return res.status(200).json(updatedQuestion);

  } catch (err) {
    console.error('Error editing question:', err);
    return res.status(500).json({ message: 'Failed to edit question' });
  }
};

export const deleteQuestion = async (req, res) => {
  const { id } = req.params; 

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid question ID format' });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const test = await Test.findById(question.testId);
    if (!test) {
      return res.status(404).json({ message: 'Associated test not found' });
    }

    if (test.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Question.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    return res.status(500).json({ message: 'Failed to delete question' });
  }
};
