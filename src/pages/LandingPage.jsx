import React from "react";
import { Link } from "react-router-dom";
import HeroStudying from "../assets/hero_studying.svg";
import SmartSummarizing from "../assets/summary_showcase.png";
import InstantFlashcards from "../assets/flashcards_showcase.png";

function LandingPage() {
  return (
    <div className="text-text max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row justify-between items-center h-[calc(100vh-64px)] text-center lg:text-left gap-6">
        <div className="max-w-md">
          <p className="text-primary text-4xl font-bold">
            Study smarter, not harder.
          </p>
          <p className="text-lg mt-2">
            Turn your class notes into instant summaries and flashcards.
          </p>
          <Link to="/signup">
            <button className="btn-primary mt-4 text-lg">Sign Up Free</button>
          </Link>
        </div>
        <img
          src={HeroStudying}
          className="w-4/5 max-w-md lg:max-w-none lg:w-1/2"
          alt="Illustration of a student reading notes"
        />
      </section>

      {/* Flashcards Feature */}
      <section className="flex flex-col lg:flex-row justify-between items-center mt-20 gap-8">
        <img
          src={InstantFlashcards}
          className="w-full lg:w-3/5"
          alt="SmartNotes flashcards feature in use"
        />
        <div>
          <h3 className="text-3xl font-semibold">Instant Flashcards</h3>
          <p className="text-text-light text-lg mt-2">
            Save time with our AI that detects key concepts and auto-generates
            flashcards so you can focus on what matters.
          </p>
        </div>
      </section>

      {/* Summary Feature */}
      <section className="flex flex-col-reverse lg:flex-row justify-between items-center mt-20 gap-8">
        <div>
          <h3 className="text-3xl font-semibold">Smart Summarizing</h3>
          <p className="text-text-light text-lg mt-2">
            No more skimming long paragraphs — get clean, AI-powered summaries
            that help you retain faster.
          </p>
        </div>
        <img
          src={SmartSummarizing}
          className="w-full lg:w-3/5"
          alt="SmartNotes summarization feature shown on screen"
        />
      </section>
      {/* Testimonials Section */}
      <section className="my-24 text-center">
        <h3 className="text-3xl font-semibold mb-10">
          What Students Are Saying
        </h3>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Testimonial 1 */}
          <div className="bg-background-secondary p-6 rounded-2xl shadow-md">
            <p className="text-lg italic">
              “This app turned my messy notes into organized study guides. I
              saved hours!”
            </p>
            <div className="mt-4">
              <p className="font-semibold text-primary">Maya L.</p>
              <p className="text-sm text-text-light">High School Junior</p>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-background-secondary p-6 rounded-2xl shadow-md">
            <p className="text-lg italic">
              “SmartNotes helped me prep for finals in a way that actually
              stuck.”
            </p>
            <div className="mt-4">
              <p className="font-semibold text-primary">Josh T.</p>
              <p className="text-sm text-text-light">College Freshman</p>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-background-secondary p-6 rounded-2xl shadow-md">
            <p className="text-lg italic">
              “The flashcards are my favorite part — they’re instant and spot-on
              every time.”
            </p>
            <div className="mt-4">
              <p className="font-semibold text-primary">Emily S.</p>
              <p className="text-sm text-text-light">Pre-Med Student</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center my-20">
        <p className="text-2xl font-medium">Start studying smarter today</p>
        <Link to="/signup">
          <button className="btn-primary mt-4 text-lg">Get Started</button>
        </Link>
      </section>
    </div>
  );
}

export default LandingPage;
