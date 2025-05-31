// Імпорт моделей
import User from "./user.model.js";
import Advertisement from "./advertisement.model.js";
import Category from "./categories.model.js";
import Image from "./image.model.js";
import Payment from "./payments.model.js";
import Complaint from "./complaints.model.js";
import Review from "./reviews.model.js";
import Chat from "./chat.model.js";
import Message from "./messages.model.js";
import Subscription from "./subscriptions.model.js";

// Зв'язки між таблицями


// 1. User - Advertisement
// Один користувач може створювати кілька оголошень
User.hasMany(Advertisement, { foreignKey: "user_id" });
Advertisement.belongsTo(User, { foreignKey: "user_id" });

// 2. Category - Advertisement
// Одна категорія може містити багато оголошень
Category.hasMany(Advertisement, { foreignKey: "categorie_id" });
Advertisement.belongsTo(Category, { foreignKey: "categorie_id" });

// 3. Advertisement - Image
// Одне оголошення може містити кілька зображень
Advertisement.hasMany(Image, { foreignKey: "advertisement_id" });
Image.belongsTo(Advertisement, { foreignKey: "advertisement_id" });

// 4. Advertisement - Payment
// Одне оголошення може мати кілька платежів (наприклад, для послуг)
// Так само один користувач може здійснювати декілька платежів
Advertisement.hasMany(Payment, { foreignKey: "advertisement_id" });
Payment.belongsTo(Advertisement, { foreignKey: "advertisement_id" });

User.hasMany(Payment, { foreignKey: "user_id" });
Payment.belongsTo(User, { foreignKey: "user_id" });

// 5. Advertisement - Complaint
// Кожне оголошення може мати кілька скарг, які надходять від користувачів
Advertisement.hasMany(Complaint, { foreignKey: "advertisement_id" });
Complaint.belongsTo(Advertisement, { foreignKey: "advertisement_id" });

User.hasMany(Complaint, { foreignKey: "user_id" });
Complaint.belongsTo(User, { foreignKey: "user_id" });

// 6. Review (Оцінки)
// Кожен оглядач (Reviewer) може залишити кілька відгуків щодо інших користувачів (Reviewed)
User.hasMany(Review, { as: "ReviewsGiven", foreignKey: "user_reviewer_id" });
Review.belongsTo(User, { as: "Reviewer", foreignKey: "user_reviewer_id" });

User.hasMany(Review, { as: "ReviewsReceived", foreignKey: "user_reviewed_id" });
Review.belongsTo(User, { as: "Reviewed", foreignKey: "user_reviewed_id" });

// 7. Advertisement - Chat
// Оголошення може бути пов'язане з декількома чатами (розмовами) між користувачами
Advertisement.hasMany(Chat, { foreignKey: "advertisement_id" });
Chat.belongsTo(Advertisement, { foreignKey: "advertisement_id" });

// 8. Chat - Users (розмови між двома користувачами)
// В моделі Chat зберігаються два учасники: user_id_1 та user_id_2
Chat.belongsTo(User, { as: "User1", foreignKey: "user_id_1" });
Chat.belongsTo(User, { as: "User2", foreignKey: "user_id_2" });
User.hasMany(Chat, { as: "ChatsAsUser1", foreignKey: "user_id_1" });
User.hasMany(Chat, { as: "ChatsAsUser2", foreignKey: "user_id_2" });

// 9. Chat - Message
// Один чат може містити багато повідомлень, кожне з яких належить своєму чату
Chat.hasMany(Message, { foreignKey: "chat_id", as: 'Messages' });
Message.belongsTo(Chat, { foreignKey: "chat_id" });

// Також можна зв'язати повідомлення з користувачем, який його відправив
User.hasMany(Message, { foreignKey: "user_id" });
Message.belongsTo(User, { foreignKey: "user_id" });

// 10. User - Subscription
// Один користувач може підписатись на багато категорій
User.hasMany(Subscription, { foreignKey: "user_id" });
Subscription.belongsTo(User, { foreignKey: "user_id" });

// 11. Category - Subscription
// Одна категорія може мати багато підписників
Category.hasMany(Subscription, { foreignKey: "categorie_id" });
Subscription.belongsTo(Category, { foreignKey: "categorie_id" });

const models = {
  User,
  Advertisement,
  Category,
  Image,
  Payment,
  Complaint,
  Review,
  Chat,
  Message,
  Subscription,
};

export default models;
