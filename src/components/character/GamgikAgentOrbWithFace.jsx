'use client';

import './character.css';

import React, { useEffect, useRef, useState } from 'react';
import { GarimReferenceOrb } from './GamgikBlobOrb.jsx';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function AgentFace({ look, expression }) {
  const faceY = look.y * 6.2;
  const eyeY = look.y * 10.5;

  return (
    <div
      className={`garim-agent-face is-${expression}`}
      style={{
        '--face-x': `${look.x * 4.6}px`,
        '--face-y': `${faceY}px`,
        '--eye-x': `${look.x * 8.8}px`,
        '--eye-y': `${eyeY}px`,
      }}
    >
      <div className="garim-face-glow" />

      <div className="garim-eye-layer">
        <span className="garim-eye garim-eye-left" aria-hidden="true">
          <i className="garim-eye-pillar" />
          <i className="garim-chevron-line garim-chevron-top" />
          <i className="garim-chevron-line garim-chevron-bottom" />
        </span>

        <span className="garim-eye garim-eye-right" aria-hidden="true">
          <i className="garim-eye-pillar" />
          <i className="garim-chevron-line garim-chevron-top" />
          <i className="garim-chevron-line garim-chevron-bottom" />
        </span>
      </div>

      <div className="garim-tear-layer" aria-hidden="true">
        <i className="garim-tear garim-tear-left" />
        <i className="garim-tear garim-tear-right" />
      </div>
    </div>
  );
}

function SearchDecorations({ expression }) {
  return (
    <svg className={`garim-search-scene is-${expression}`} viewBox="0 0 460 460" aria-hidden="true">
      <defs>
        <filter id="garimSearchGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0.58 0 0 0 0.22  0 0.48 0 0 0.2  0 0 1 0 1  0 0 0 0.85 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        className="garim-search-card garim-search-card-bar"
        transform="translate(38 80) rotate(-3)"
      >
        <rect className="garim-search-shape" x="0" y="0" width="128" height="34" rx="14" />
        <rect className="garim-search-line" x="10" y="8" width="82" height="18" rx="9" />
        <line className="garim-search-icon-line" x1="96" y1="10" x2="96" y2="25" />
        <circle className="garim-search-icon-line" cx="111" cy="15" r="6.5" />
        <line className="garim-search-icon-line" x1="116" y1="20" x2="123" y2="26" />
      </g>

      <g
        className="garim-search-card garim-search-card-window"
        transform="translate(52 266) rotate(4)"
      >
        <rect className="garim-search-shape" x="0" y="0" width="112" height="72" rx="13" />
        <line className="garim-search-icon-line" x1="0" y1="20" x2="112" y2="20" />
        <circle className="garim-search-dot" cx="13" cy="10" r="3" />
        <circle className="garim-search-dot" cx="24" cy="10" r="3" />
        <circle className="garim-search-dot" cx="35" cy="10" r="3" />
        <line className="garim-search-line" x1="22" y1="34" x2="84" y2="39" />
        <line className="garim-search-line" x1="22" y1="48" x2="69" y2="52" />
        <line className="garim-search-line" x1="22" y1="60" x2="80" y2="64" />
      </g>

      <g
        className="garim-search-card garim-search-card-result"
        transform="translate(293 78) rotate(3)"
      >
        <rect className="garim-search-shape" x="0" y="0" width="126" height="74" rx="14" />
        <line className="garim-search-icon-line" x1="0" y1="21" x2="126" y2="21" />
        <circle className="garim-search-dot" cx="14" cy="11" r="3" />
        <circle className="garim-search-dot" cx="25" cy="11" r="3" />
        <circle className="garim-search-dot" cx="36" cy="11" r="3" />
        <rect className="garim-search-icon-line" x="17" y="32" width="29" height="29" rx="4" />
        <line className="garim-search-line" x1="59" y1="36" x2="112" y2="39" />
        <line className="garim-search-line" x1="59" y1="49" x2="99" y2="51" />
        <line className="garim-search-line" x1="59" y1="61" x2="93" y2="63" />
      </g>

      <g
        className="garim-search-card garim-search-card-small"
        transform="translate(316 279) rotate(4)"
      >
        <rect className="garim-search-shape" x="0" y="0" width="92" height="45" rx="13" />
        <circle className="garim-search-icon-line" cx="25" cy="20" r="9" />
        <line className="garim-search-icon-line" x1="32" y1="27" x2="44" y2="39" />
        <line className="garim-search-line" x1="51" y1="16" x2="81" y2="18" />
        <line className="garim-search-line" x1="51" y1="29" x2="73" y2="31" />
        <g className="garim-search-magnifier" transform="translate(76 -42) rotate(42)">
          <circle className="garim-search-shape" cx="0" cy="0" r="13" />
          <circle className="garim-search-icon-line" cx="0" cy="0" r="8" />
          <rect className="garim-search-shape" x="10" y="-4" width="22" height="9" rx="4" />
          <rect className="garim-search-icon-line" x="15" y="-2" width="11" height="5" rx="2" />
        </g>
      </g>

      <g className="garim-search-sparkles">
        <path className="garim-search-plus" d="M72 142 v20 M62 152 h20" />
        <path className="garim-search-plus" d="M92 124 v15 M84.5 131.5 h15" />
        <path className="garim-search-plus" d="M355 54 v17 M346.5 62.5 h17" />
        <path className="garim-search-plus" d="M392 196 v20 M382 206 h20" />
        <path className="garim-search-plus" d="M424 230 v16 M416 238 h16" />
        <path className="garim-search-minus" d="M110 124 h20" />
        <path className="garim-search-minus" d="M66 360 h24" />
        <circle className="garim-search-dot-large" cx="342" cy="398" r="4" />
        <circle className="garim-search-dot-large" cx="356" cy="390" r="4" />
        <circle className="garim-search-dot-large" cx="370" cy="381" r="4" />
      </g>
    </svg>
  );
}

export default function GarimAgentOrbWithFace({
  size = 460,
  speed = 0.95,
  motion = 0.78,
  themeMode = 'light',
  className = '',
  expressionOverride = null,
}) {
  const wrapRef = useRef(null);
  const blinkTimerRef = useRef(null);
  const clickTimerRef = useRef(null);
  const motionTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const expressionStartTimerRef = useRef(null);
  const expressionTimerRef = useRef(null);
  const expressionRef = useRef('idle');

  const [look, setLook] = useState({ x: 0, y: 0 });
  const [expression, setExpression] = useState('idle');
  const [isClickMoving, setIsClickMoving] = useState(false);
  const visibleExpression = expressionOverride ?? expression;

  function triggerExpression(nextExpression, duration = 520) {
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    if (expressionStartTimerRef.current) window.clearTimeout(expressionStartTimerRef.current);
    if (expressionTimerRef.current) window.clearTimeout(expressionTimerRef.current);

    setExpression(nextExpression);

    expressionStartTimerRef.current = window.setTimeout(() => {
      setExpression('blink');

      expressionTimerRef.current = window.setTimeout(() => {
        setExpression('idle');
      }, 120);
    }, duration);
  }

  useEffect(() => {
    expressionRef.current = visibleExpression;
  }, [visibleExpression]);

  useEffect(() => {
    function scheduleBlink() {
      const delay = 1800 + Math.random() * 2400;

      blinkTimerRef.current = window.setTimeout(() => {
        if (expressionRef.current !== 'idle') {
          scheduleBlink();
          return;
        }

        setExpression('blink');

        resetTimerRef.current = window.setTimeout(() => {
          setExpression('idle');
          scheduleBlink();
        }, 140);
      }, delay);
    }

    scheduleBlink();

    return () => {
      if (blinkTimerRef.current) window.clearTimeout(blinkTimerRef.current);
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
      if (motionTimerRef.current) window.clearTimeout(motionTimerRef.current);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      if (expressionStartTimerRef.current) window.clearTimeout(expressionStartTimerRef.current);
      if (expressionTimerRef.current) window.clearTimeout(expressionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function isPointerInsideViewport(event) {
      return (
        event.clientX >= 0 &&
        event.clientX <= window.innerWidth &&
        event.clientY >= 0 &&
        event.clientY <= window.innerHeight
      );
    }

    function resetLook() {
      setLook({ x: 0, y: 0 });
    }

    function handlePointerMove(event) {
      if (!isPointerInsideViewport(event)) {
        resetLook();
        return;
      }

      const rect = wrapRef.current?.getBoundingClientRect();
      const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      const range = Math.max(rect ? Math.min(rect.width, rect.height) * 0.62 : 180, 1);

      const x = (event.clientX - centerX) / range;
      const y = (event.clientY - centerY) / range;

      setLook({
        x: clamp(x, -1, 1),
        y: clamp(y, -1, 1),
      });
    }

    function handlePointerOut(event) {
      if (!event.relatedTarget) {
        resetLook();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') {
        resetLook();
      }
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', resetLook);
    window.addEventListener('blur', resetLook);
    document.addEventListener('pointerout', handlePointerOut);
    document.addEventListener('mouseleave', resetLook);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', resetLook);
      window.removeEventListener('blur', resetLook);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('mouseleave', resetLook);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  function playClickMotion() {
    if (motionTimerRef.current) window.clearTimeout(motionTimerRef.current);

    setIsClickMoving(false);

    window.requestAnimationFrame(() => {
      setIsClickMoving(true);
      motionTimerRef.current = window.setTimeout(() => {
        setIsClickMoving(false);
      }, 520);
    });
  }

  function handleClick(event) {
    if (event.detail >= 2) {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
      playClickMotion();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const nextExpression = event.clientX < rect.left + rect.width / 2 ? 'wink-left' : 'wink-right';

    clickTimerRef.current = window.setTimeout(() => {
      triggerExpression(nextExpression, 520);
    }, 180);
  }

  return (
    <div
      ref={wrapRef}
      className={`garim-agent-orb-wrap is-${themeMode} ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
      onClick={handleClick}
    >
      <div
        className={`garim-agent-motion ${
          isClickMoving || visibleExpression === 'surprised' ? 'is-click-moving' : ''
        }`}
      >
        <GarimReferenceOrb size={size} speed={speed} motion={motion} themeMode={themeMode} />

        <SearchDecorations expression={visibleExpression} />

        <AgentFace look={look} expression={visibleExpression} />

        <div className={`garim-surprise-marks is-${visibleExpression}`} aria-hidden="true">
          <i className="garim-surprise-mark garim-surprise-mark-left" />
          <i className="garim-surprise-mark garim-surprise-mark-middle" />
          <i className="garim-surprise-mark garim-surprise-mark-right" />
        </div>

        <div className={`garim-anger-mark is-${visibleExpression}`} aria-hidden="true">
          <span className="garim-anger-corner garim-anger-corner-top">
            <i className="garim-chevron-line garim-chevron-top" />
            <i className="garim-chevron-line garim-chevron-bottom" />
          </span>
          <span className="garim-anger-corner garim-anger-corner-right">
            <i className="garim-chevron-line garim-chevron-top" />
            <i className="garim-chevron-line garim-chevron-bottom" />
          </span>
          <span className="garim-anger-corner garim-anger-corner-bottom">
            <i className="garim-chevron-line garim-chevron-top" />
            <i className="garim-chevron-line garim-chevron-bottom" />
          </span>
          <span className="garim-anger-corner garim-anger-corner-left">
            <i className="garim-chevron-line garim-chevron-top" />
            <i className="garim-chevron-line garim-chevron-bottom" />
          </span>
        </div>
      </div>
    </div>
  );
}
