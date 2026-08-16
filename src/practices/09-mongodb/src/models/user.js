import mongoose from 'mongoose';

// TODO: name·email 검증과 정규화, unique index, timestamps를 설정하세요.
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

export const User = mongoose.models.User ?? mongoose.model('User', userSchema);
