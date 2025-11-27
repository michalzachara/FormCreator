import mongoose from 'mongoose'

const { Schema } = mongoose

const submissionSchema = new Schema(
	{
		testId: {
			type: Schema.Types.ObjectId,
			ref: 'Test',
			required: true,
		},
		studentName: {
			type: String,
			required: true,
			trim: true,
		},
		studentSurname: {
			type: String,
			required: true,
			trim: true,
		},
		studentClass: {
			type: String,
			required: true,
			trim: true,
		},
		answers: {
			type: [Number],
			required: true,
		},
		score: {
			type: Number,
			required: true,
		},
		submittedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
)
const Submission = mongoose.model('Submission', submissionSchema)

export default Submission
