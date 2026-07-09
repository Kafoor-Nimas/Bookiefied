import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/type";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.models";

export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(data.title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        success: true,
        data: serializeData(existingBook),
        alreadyExists: true,
      };
    }

    // Todo:Check subscription limits before creating a book

    const book = await Book.create({ ...data, slug, totalSegments: 0 });

    return {
      success: true,
      data: serializeData(book),
    };
  } catch (error) {
    console.error("Error creating a book", error);

    return {
      success: false,
      error: error,
    };
  }
};

export const saveBookSegments = async (
  bookId: string,
  clerkId: string,
  segments: TextSegment[],
) => {
  try {
    await connectToDatabase();

    console.log("Saving book segments ...");

    const segmentsToInsert = segments.map(
      ({ text, segmentIndex, pageNumber, wordCount }) => ({
        clerkId,
        bookId,
        content: text,
        segmentIndex,
        pageNumber,
        wordCount,
      }),
    );

    await BookSegment.insertMany(segmentsToInsert);

    await Book.findByIdAndUpdate(bookId,{totalSegments:segments.length});

    console.log('Book sements saved successfully.')

    return{
        success:true,
        data:{segmentsCreated:segments.length}
    }
  } catch (e) {
    console.error("Error saving book segments", e);

    await BookSegment.deleteMany({ bookId });
    await Book.findByIdAndDelete(bookId);
    console.log(
      "Deleted book segments and book due to failure to save segments.",
    );
  }
};
