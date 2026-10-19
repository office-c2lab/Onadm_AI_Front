import { useId } from 'react';
import './TripleDotLoader.css';

export default function TripleDotLoader({ className = '', themeMode = 'light' }) {
  const filterId = useId().replace(/:/g, '');

  return (
    <div className={`status-infinity-loader is-${themeMode} ${className}`.trim()}>
      <div
        className="status-infinity-loader__chrome"
        style={{ '--loader-filter': `url(#${filterId})` }}
      >
        <div />
        <div />
        <div />
      </div>

      <div className="status-infinity-loader__fallback">
        <div>
          <span />
        </div>
        <div>
          <span />
        </div>
        <div>
          <span />
        </div>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        aria-hidden="true"
        className="status-infinity-loader__defs"
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
