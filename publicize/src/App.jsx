import TwoCol, { Left, Right } from './components/TwoCol';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';

function App() {
const embedCode = `<script src="https://publicizeanalytics.vercel.app/publicize.js"></script>`;
const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <>
    <div role="alert" className="alert">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
  <span>Publicize is 100% free and open source</span>
</div>
      <div className="hero bg-base-200 min-h-screen">
        
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">The future of transparency for SaaS and more</h1>
            <p className="py-6">
              Publicize Analytics provides a simple and complete way to share who uses your services and how they interact with them with your userbase.
            </p>
            <a href="#threecard">
              <button className="btn btn-primary">Get Started</button>
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-10 mt-12 mb-12" id="threecard">

        <div className="card bg-base-300 w-[32rem] shadow-md p-8 m-6 border-0">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-3xl">Detailed interactions</h2>
            <p className="text-lg">
              Track button clicks, scrolling, navigation flow through pages, and more. Correlate with User-Agent data like geographic location, device, and more for valuable insights.
            </p>
          </div>
        </div>

        <div className="card bg-base-300 w-[32rem] shadow-md p-8 m-6 border-0">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-3xl">100% transparent</h2>
            <p className="text-lg">
              Any user, without logging in or paying a fee, can access your site's analytics so you can build trust with your customers- while also giving you the option to hide sensitive data.
            </p>
          </div>
        </div>

        <div className="card bg-base-300 w-[32rem] shadow-md p-8 m-6 border-0">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-3xl">Painless integration</h2>
            <p className="text-lg">
              Publicize supports virtually all frameworks and technologies- just add a script tag or a few lines of JSX and you're ready to go. Publish interaction data with one-liner functions.
            </p>
          </div>
        </div>

      </div>
      <TwoCol>
        <Left>
          <h2 className="text-4xl font-bold mb-4">Get started in ~5 minutes</h2>
          <p className="text-lg mb-6">
            Just embed a simple script in your HTML and tracking will be set up automatically
          </p>
          <button className="btn btn-primary" onClick={handleCopy}>
      {copied ? 'Copied to clipboard' : 'Copy Snippet'}
    </button>
        </Left>
        <Right>
          <div className="mockup-code w-full min-h-[8rem]">
            <SyntaxHighlighter language="html" style={dracula} customStyle={{ background: 'transparent' }}>
              {embedCode}
            </SyntaxHighlighter>
          </div>
        </Right>
      </TwoCol>
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>Copyright © {new Date().getFullYear()} Publicize Analytics - Free and open source</p>
        </aside>
      </footer>
    </>
  )
}

export default App
