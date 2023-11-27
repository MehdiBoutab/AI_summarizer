import React, { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });
  
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );
    if (articlesFromLocalStorage && articlesFromLocalStorage.length > 0) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];

      setArticle({ ...article, url: "" }); // Resetting the URL field
      setAllArticles(updatedAllArticles);
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(""), 3000);
  };

  const deleteArticle = (index) => {
    const updatedArticles = allArticles.filter((_, i) => i !== index);
    setAllArticles(updatedArticles);

    if (updatedArticles.length === 0) {
      localStorage.removeItem("articles");
      setAllArticles([]);
      setArticle({ url: "", summary: "" });
      window.location.reload(); // Refresh the page
    } else {
      localStorage.setItem("articles", JSON.stringify(updatedArticles));
    }
  };


  const deleteHistory = () => {
    localStorage.removeItem("articles");
    setAllArticles([]);
    setArticle({ url: "", summary: "" });
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search */}
      <div className="flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link_icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />
          <input
            type="url"
            placeholder="Enter a URL"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            required
            className="url_input peer-focus:border-gray-700 peer-focus:text-gray-700"
          />
          <button type="submit" className="submit_btn">
            ↵
          </button>
        </form>

        {/* Browse URL History */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.map((item, index) => (
            <div
              className="link_card"
              key={`link-${index}`}
              onClick={() => setArticle(item)}
            >
              <div className="copy_btn" onClick={() => handleCopy(item.url)}>
                <img
                  src={copied === item.url ? tick : copy}
                  alt="copy_icon"
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              <p className="flex-1 text-blue-700 font-medium text-sm truncate font-satoshi">
                {item.url}
              </p>
              <button
                onClick={() => deleteArticle(index)}
                className="delete_btn flex items-center justify-center border-none bg-transparent cursor-pointer transition duration-300 ease-in-out"
                style={{ width: '20px', height: '20px' }}
              >
                <img
                  src="https://img.icons8.com/fluency-systems-filled/48/filled-trash.png"
                  alt="filled-trash"
                  className="w-full h-full transform transition duration-300 ease-in-out hover:scale-125"
                />
              </button>

            </div>
          ))}
        </div>
      </div>

      {/* Display Results */}
      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Well that wasn't supposed to happen...
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Article{" "}
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-2 py-1 rounded">
                  Summary
                </span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Delete History Button */}
      {allArticles.length > 0 && (
        <button
          className="delete_history_btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
          onClick={deleteHistory}
        >
          Delete History
        </button>
      )}
    </section>
  );
};

export default Demo;
