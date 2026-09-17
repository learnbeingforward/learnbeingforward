import type { CourseContentData } from "./types";

const data: CourseContentData = {
  courseSlug: "data-science-ai-fundamentals",
  modules: [
    {
      moduleTitle: "Python for Data Science",
      sections: [
        {
          heading: "Why Python for Data Work",
          body: "Python has become the default language for data science and AI largely because of its ecosystem, not the language itself — libraries like NumPy, Pandas, and scikit-learn provide fast, well-tested implementations of the operations data work needs constantly, and its readable syntax makes it easy to express data transformations clearly. A data scientist rarely writes performance-critical low-level code directly in Python; instead, they use these libraries, which are themselves implemented in faster languages underneath (much of NumPy and Pandas' core is written in C), getting both Python's readability and near-native speed for the actual number-crunching.",
        },
        {
          heading: "Python Fundamentals for Data Work",
          body: "The Python fundamentals that matter most for data work: lists and dictionaries as the basic data structures (before you ever touch a library-specific structure like a DataFrame), list comprehensions for concise data transformations, and functions for making repeated analysis steps reusable. Understanding Python's core iteration and data structures deeply pays off constantly, since even when working inside Pandas or NumPy, you're frequently converting between their specialized structures and plain Python lists/dicts at the boundaries of an analysis.",
        },
        {
          heading: "Working with Files & Data Formats",
          body: "Real-world data rarely arrives as a clean, ready-to-use structure — it arrives as files, and the first job is reading them correctly:",
          bullets: [
            "CSV — the most common tabular format; comma-separated values, usually with a header row naming each column.",
            "JSON — nested, hierarchical data, common for API responses and semi-structured records.",
            "Excel — common in business contexts, often with multiple sheets and merged/formatted cells that complicate clean parsing.",
            "Understanding encoding issues (files not being plain UTF-8), missing values represented inconsistently (empty string vs. 'NA' vs. 'null' vs. an actual blank), and malformed rows are practical realities of working with files that no tutorial dataset prepares you for.",
          ],
        },
        {
          heading: "Scripting for Automation",
          body: "A large part of practical data science work is automation — running the same cleaning, transformation, or reporting steps repeatedly, reliably, on new data as it arrives, rather than manually repeating steps in a notebook every time. Writing analysis as reusable functions and scripts (rather than one long sequence of ad-hoc notebook cells) makes it possible to re-run an entire pipeline on new data with one command, schedule it to run automatically, and hand it off to someone else without them needing to understand every intermediate step by reading your mind.",
        },
      ],
      links: [
        { label: "Python Official Documentation", url: "https://docs.python.org/3/" },
        { label: "Pandas Official Documentation", url: "https://pandas.pydata.org/docs/" },
        { label: "freeCodeCamp YouTube Channel", url: "https://www.youtube.com/@freecodecamp" },
      ],
    },
    {
      moduleTitle: "Statistics Basics",
      sections: [
        {
          heading: "Descriptive Statistics",
          body: "Before drawing any conclusion from data, you need to describe what's actually in it. Measures of central tendency — mean (average), median (the middle value when sorted, resistant to outliers), and mode (most frequent value) — summarize where data is centered. Measures of spread — range, variance, and standard deviation — describe how much data varies around that center. A dataset with the same mean can look completely different depending on its spread, which is why reporting a mean alone, without any measure of spread, often hides more than it reveals.",
        },
        {
          heading: "Probability Fundamentals",
          body: "Probability quantifies uncertainty — the likelihood of an event occurring, expressed as a number between 0 (impossible) and 1 (certain). Core concepts that come up constantly in data work: independent events (one event's outcome doesn't affect another's probability), conditional probability (the probability of an event given that another has already happened, written P(A|B)), and the difference between correlation and causation — two variables moving together does not, by itself, mean one causes the other. This last distinction is one of the most commonly violated principles in casual data analysis, and catching it is a genuinely valuable skill.",
        },
        {
          heading: "Distributions",
          body: "A distribution describes how values in a dataset are spread across their possible range. The normal (Gaussian) distribution — the familiar bell curve, symmetric around its mean — appears constantly in nature and is the foundation for many statistical methods that assume data is roughly normally distributed. Other common distributions include the uniform distribution (every value in a range equally likely) and skewed distributions (where data clusters toward one end, common in real-world data like income or wait times). Visualizing a variable's distribution (via a histogram) before analyzing it further is a habit that catches a surprising number of data-quality problems early.",
        },
        {
          heading: "Hypothesis Testing Basics",
          body: "Hypothesis testing is the formal process of using sample data to decide whether an observed effect is likely real or could plausibly be due to random chance. The core idea: state a null hypothesis (there's no real effect), collect data, and calculate a p-value (roughly, how surprising the observed data would be if the null hypothesis were actually true). A small p-value (commonly below 0.05, though that threshold is a convention, not a law of nature) suggests the observed effect is unlikely to be pure chance. This is genuinely subtle — a low p-value doesn't prove an effect is real or important, only that it's unlikely under the null hypothesis, and it says nothing about practical significance.",
        },
      ],
      links: [
        { label: "Khan Academy — Statistics and Probability", url: "https://www.khanacademy.org/math/statistics-probability" },
        { label: "NPTEL — Statistics for Data Science", url: "https://nptel.ac.in/" },
        { label: "StatQuest YouTube Channel", url: "https://www.youtube.com/@statquest" },
      ],
    },
    {
      moduleTitle: "ML Fundamentals & Libraries",
      sections: [
        {
          heading: "Supervised vs. Unsupervised Learning",
          body: "Supervised learning trains a model on labeled data — input examples paired with the correct answer — so the model learns to predict that answer for new, unseen inputs. It splits further into classification (predicting a category, like spam/not-spam) and regression (predicting a continuous number, like a house price). Unsupervised learning works with unlabeled data, finding structure without being told the 'right answer' — clustering (grouping similar data points together) and dimensionality reduction (compressing many features into fewer, more informative ones) are the two most common tasks. The choice between them starts with one question: does your data have labeled correct answers to learn from, or not?",
        },
        {
          heading: "Model Evaluation Basics",
          body: "A model that performs well on the data it was trained on tells you almost nothing about how it will perform on new data — this is why data is split into a training set (used to fit the model) and a test set (held out, used only to evaluate it afterward). Overfitting happens when a model learns the training data's noise and quirks rather than its genuine underlying pattern, performing great on training data but poorly on new data; underfitting is the opposite — a model too simple to capture the real pattern, performing poorly on both. For classification, accuracy alone can be misleading on imbalanced data (e.g. 99% accuracy predicting 'not fraud' when only 1% of transactions are actually fraud is worthless) — precision, recall, and the confusion matrix give a fuller picture.",
        },
        {
          heading: "NumPy & Pandas Workflows",
          body: "NumPy provides fast, memory-efficient arrays and the mathematical operations that work on them (this is the foundation almost every other data/ML library in Python is built on top of). Pandas builds on NumPy to provide the DataFrame — a labeled, tabular structure much like a spreadsheet or SQL table — along with operations to filter, group, join, and reshape data. A typical real workflow moves from raw files, through Pandas for cleaning and exploring, into NumPy arrays (often implicitly, via scikit-learn) for the actual model training step.",
        },
        {
          heading: "scikit-learn Pipelines",
          body: "scikit-learn provides a consistent interface across dozens of ML algorithms — nearly every model exposes the same .fit(X, y) (train on data) and .predict(X) (make predictions) methods, which makes it straightforward to try multiple algorithms on the same problem with minimal code changes. A Pipeline chains together preprocessing steps (like scaling numeric features or encoding categorical ones) and a final model into a single object, ensuring the exact same preprocessing is applied consistently to both training data and any new data the model later predicts on — a common source of subtle bugs when preprocessing is done manually and inconsistently.",
        },
      ],
      links: [
        { label: "scikit-learn Official Documentation", url: "https://scikit-learn.org/stable/" },
        { label: "NumPy Official Documentation", url: "https://numpy.org/doc/" },
        { label: "Google's Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
      ],
    },
    {
      moduleTitle: "Intro to AI Concepts",
      sections: [
        {
          heading: "What Machine Learning and AI Actually Are",
          body: "Artificial Intelligence is the broad field of building systems that perform tasks normally requiring human intelligence. Machine Learning is a specific approach to AI: instead of explicitly programming every rule, a system learns patterns directly from data. Deep Learning is a further subset of ML using neural networks with many layers, particularly effective on unstructured data like images, audio, and text. Understanding this nesting — AI contains ML, which contains Deep Learning as one approach within it — clears up a lot of confusion caused by these terms being used loosely and interchangeably in casual conversation and media coverage.",
        },
        {
          heading: "Common AI Application Areas",
          body: "AI/ML techniques show up across a wide range of practical applications, each suited to different types of data and problems:",
          bullets: [
            "Computer vision — image classification, object detection, facial recognition.",
            "Natural language processing (NLP) — text classification, translation, sentiment analysis, and the large language models behind modern chatbots.",
            "Recommendation systems — predicting what a user is likely to want next, based on their and similar users' past behavior.",
            "Predictive analytics — forecasting future values (sales, demand, risk) from historical data.",
          ],
        },
        {
          heading: "Responsible AI Basics",
          body: "Deploying AI systems responsibly means being aware of several real risks: bias, where a model trained on historically biased data reproduces or amplifies that bias in its predictions (e.g. a hiring model trained on a company's past hires, if those hires skewed in some demographic direction); explainability, since some model types (especially deep learning) are effectively black boxes, making it hard to explain why a specific prediction was made — a real problem in high-stakes domains like lending or healthcare; and privacy, since training data often contains sensitive personal information that needs careful handling and, where required, anonymization or consent. Treating these as first-class engineering concerns, not afterthoughts, is table stakes for any AI system used on real people.",
        },
        {
          heading: "Where This Course Leaves You",
          body: "This module intentionally stays introductory — a working conceptual map of the field rather than deep technical mastery of any one area. From here, the natural next steps for a student wanting to go further are: deeper statistics and linear algebra (the actual math underlying most ML algorithms), a specific application area (computer vision or NLP) studied in depth, and — most importantly — practicing on real, messy datasets rather than only clean tutorial data, since real-world data cleaning and problem framing is where most of an actual data scientist's time goes, not model training itself.",
        },
      ],
      links: [
        { label: "Google's Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
        { label: "3Blue1Brown — Neural Networks Series", url: "https://www.youtube.com/@3blue1brown" },
        { label: "GeeksforGeeks — Machine Learning", url: "https://www.geeksforgeeks.org/machine-learning/" },
      ],
    },
  ],
};

export default data;
