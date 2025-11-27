import mongoose from 'mongoose'

const { Schema } = mongoose

const testSchema = Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		uniqueLink: {
			type: String,
			required: true,
			unique: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

testSchema.virtual('questions', {
	ref: 'Question',
	localField: '_id',
	foreignField: 'testId',
	justOne: false,
})

const Test = mongoose.model('Test', testSchema)

export default Test
