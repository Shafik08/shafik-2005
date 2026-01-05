const mongoose = require("mongoose");
const Book = require("./models/book");

// --------------------
// MongoDB Connection
// --------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/libraryDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Connection error:", err));

// --------------------
// INSERT BOOKS
// --------------------
async function insertBooks() {
  const count = await Book.countDocuments();
  if (count > 0) {
    console.log("Books already exist. Skipping insert.");
    return;
  }

  await Book.insertMany([
    { title: "Clean Code", author: "Robert Martin", category: "Programming", publishedYear: 2018, availableCopies: 5 },
    { title: "Atomic Habits", author: "James Clear", category: "Self-Help", publishedYear: 2019, availableCopies: 4 },
    { title: "Deep Work", author: "Cal Newport", category: "Productivity", publishedYear: 2016, availableCopies: 3 },
    { title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", publishedYear: 2015, availableCopies: 6 },
    { title: "Think Like a Monk", author: "Jay Shetty", category: "Self-Help", publishedYear: 2020, availableCopies: 2 },
    { title: "Eloquent JavaScript", author: "Marijn Haverbeke", category: "Programming", publishedYear: 2017, availableCopies: 7 },
    { title: "Ikigai", author: "Héctor García", category: "Self-Help", publishedYear: 2016, availableCopies: 1 }
  ]);

  console.log("7 books inserted");
}

// --------------------
// READ OPERATIONS
// --------------------
async function readAllBooks() {
  const books = await Book.find();
  console.log("\nAll Books:\n", books);
}

async function readBooksByCategory(category) {
  const books = await Book.find({ category });
  console.log(`\nBooks in category (${category}):\n`, books);
}

async function readBooksAfter2015() {
  const books = await Book.find({ publishedYear: { $gt: 2015 } });
  console.log("\nBooks published after 2015:\n", books);
}

// --------------------
// UPDATE OPERATIONS
// --------------------
async function updateCopies(bookId, change) {
  const book = await Book.findById(bookId);

  if (!book) throw new Error("Book not found");

  if (book.availableCopies + change < 0)
    throw new Error("Negative stock not allowed");

  book.availableCopies += change;
  await book.save();

  console.log("Book copies updated");
}

async function changeCategory(bookId, newCategory) {
  const book = await Book.findById(bookId);

  if (!book) throw new Error("Book not found");

  book.category = newCategory;
  await book.save();

  console.log("Book category updated");
}

// --------------------
// DELETE OPERATION
// --------------------
async function deleteIfZeroCopies(bookId) {
  const book = await Book.findById(bookId);

  if (!book) throw new Error("Book not found");

  if (book.availableCopies === 0) {
    await Book.findByIdAndDelete(bookId);
    console.log("Book deleted (copies = 0)");
  } else {
    console.log("Book not deleted (copies available)");
  }
}

// --------------------
// MAIN FUNCTION
// --------------------
async function runApp() {
  try {
    await insertBooks();

    await readAllBooks();
    await readBooksByCategory("Self-Help");
    await readBooksAfter2015();

    const sampleBook = await Book.findOne();
    if (!sampleBook) throw new Error("No books found");

    await updateCopies(sampleBook._id, -1);
    await changeCategory(sampleBook._id, "Education");

    // set copies to 0 for delete test
    sampleBook.availableCopies = 0;
    await sampleBook.save();

    await deleteIfZeroCopies(sampleBook._id);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

runApp();