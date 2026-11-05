'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ORB_ACTIONS = {
  idle: 0,
  curious: 1,
  happy: 3,
  shy: 4,
  split: 9,
};

const ORB_THEMES = {
  light: {
    bodyTop: '#168BFF',
    bodyMid: '#075DF6',
    bodyBottom: '#063CC8',
    rimWhite: '#E9FDFF',
    rimPurple: '#36E9FF',
    bottomBlue: '#00E5FF',
    outerGlow: '#15DFFF',
  },
  dark: {
    bodyTop: '#5258D8',
    bodyMid: '#303493',
    bodyBottom: '#10143D',
    rimWhite: '#FAF7FF',
    rimPurple: '#B8A7FF',
    bottomBlue: '#687DFF',
    outerGlow: '#A78BFA',
  },
};

function ResponsiveCamera({ zoom }) {
  const { camera } = useThree();

  useEffect(() => {
    // Three.js 카메라는 React 상태가 아닌 명령형 객체이므로 투영값을 직접 갱신합니다.
    // eslint-disable-next-line react-hooks/immutability
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [camera, zoom]);

  return null;
}

function OrbPlane({
  speed = 0.95,
  motion = 0.78,
  themeMode = 'light',
  action = 'idle',
  actionSequence = 0,
}) {
  const materialRef = useRef(null);
  const groupRef = useRef(null);
  const actionStartRef = useRef(null);
  const actionKeyRef = useRef('');
  const { size } = useThree();
  const theme = ORB_THEMES[themeMode] ?? ORB_THEMES.light;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAction: { value: 0 },
      uActionTime: { value: 0 },
      uAspect: { value: 1 },
      uMotion: { value: motion },
      uLightMode: { value: themeMode === 'light' ? 1 : 0 },

      uBodyTop: { value: new THREE.Color(theme.bodyTop) },
      uBodyMid: { value: new THREE.Color(theme.bodyMid) },
      uBodyBottom: { value: new THREE.Color(theme.bodyBottom) },

      uRimWhite: { value: new THREE.Color(theme.rimWhite) },
      uRimPurple: { value: new THREE.Color(theme.rimPurple) },
      uBottomBlue: { value: new THREE.Color(theme.bottomBlue) },
      uOuterGlow: { value: new THREE.Color(theme.outerGlow) },
    }),
    [motion, theme, themeMode]
  );

  useFrame(state => {
    const elapsed = state.clock.getElapsedTime();
    const t = elapsed * speed;
    const actionKey = `${action}:${actionSequence}`;

    if (actionKeyRef.current !== actionKey) {
      actionKeyRef.current = actionKey;
      actionStartRef.current = elapsed;
    }

    const actionTime = elapsed - (actionStartRef.current ?? elapsed);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      materialRef.current.uniforms.uAction.value = ORB_ACTIONS[action] ?? 0;
      materialRef.current.uniforms.uActionTime.value = actionTime;
      materialRef.current.uniforms.uAspect.value = size.width / size.height;
      materialRef.current.uniforms.uMotion.value = motion;
      materialRef.current.uniforms.uLightMode.value = themeMode === 'light' ? 1 : 0;
      materialRef.current.uniforms.uBodyTop.value.set(theme.bodyTop);
      materialRef.current.uniforms.uBodyMid.value.set(theme.bodyMid);
      materialRef.current.uniforms.uBodyBottom.value.set(theme.bodyBottom);
      materialRef.current.uniforms.uRimWhite.value.set(theme.rimWhite);
      materialRef.current.uniforms.uRimPurple.value.set(theme.rimPurple);
      materialRef.current.uniforms.uBottomBlue.value.set(theme.bottomBlue);
      materialRef.current.uniforms.uOuterGlow.value.set(theme.outerGlow);
    }

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.55) * 0.022;
      groupRef.current.rotation.z = Math.sin(t * 0.18) * 0.01;
      groupRef.current.scale.x = 1.0 + Math.sin(t * 0.42) * 0.004;
      groupRef.current.scale.y = 1.0 + Math.cos(t * 0.38) * 0.006;
    }
  });

  const vertexShader = `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;

    uniform float uTime;
    uniform float uAction;
    uniform float uActionTime;
    uniform float uAspect;
    uniform float uMotion;
    uniform float uLightMode;

    uniform vec3 uBodyTop;
    uniform vec3 uBodyMid;
    uniform vec3 uBodyBottom;
    uniform vec3 uRimWhite;
    uniform vec3 uRimPurple;
    uniform vec3 uBottomBlue;
    uniform vec3 uOuterGlow;

    mat2 rotate2d(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat2(c, -s, s, c);
    }

    float sphereRadius(float angle, float t) {
      float r = 0.585;

      // 구체 실루엣은 유지하면서 외곽만 부드럽게 움직임
      r += uMotion * 0.020 * sin(angle * 2.0 + t * 0.28);
      r += uMotion * 0.014 * sin(angle * 3.0 - t * 0.22 + 1.3);
      r += uMotion * 0.010 * sin(angle * 5.0 + t * 0.18 + 2.2);

      // 전체 호흡감
      r += uMotion * 0.010 * sin(t * 0.42);

      return r;
    }

    float orbSDF(vec2 p, float t) {
      p.x += sin(t * 0.19) * 0.004;
      p.y += cos(t * 0.17) * 0.003;

      float angle = atan(p.y, p.x);
      float radius = length(p);

      float r = sphereRadius(angle, t);

      // 아래쪽 무게감
      r += 0.008 * smoothstep(0.08, -0.72, p.y);

      return radius - r;
    }

    float morphEllipse(vec2 p, vec2 radii) {
      return (length(p / radii) - 1.0) * min(radii.x, radii.y);
    }

    float organicCircleSDF(vec2 p, float radius, float t, float offset, float amount) {
      float angle = atan(p.y, p.x);
      float edge = radius;
      edge += amount * 0.62 * sin(angle * 2.0 + t * 1.25 + offset);
      edge += amount * 0.38 * sin(angle * 3.0 - t * 0.92 + offset * 1.7);
      return length(p) - edge;
    }

    float morphUnion(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }

    float motionDuration(float actionIndex) {
      if (actionIndex < 1.5) return 3.7;
      if (actionIndex < 3.5) return 3.9;
      if (actionIndex < 4.5) return 4.0;
      return 1.2;
    }

    float orbMotionSDF(vec2 p, float t) {
      float original = orbSDF(p, t);
      if (uAction < 0.5) return original;

      // 액션 형상 위에서도 idle 오브의 외곽 물결과 호흡이 계속 살아 있도록
      // 기본 구체 대비 현재 오브의 유기적인 변형량을 별도로 보존합니다.
      float neutralSphere = length(p) - 0.585;
      float livingDeformation = original - neutralSphere;

      float duration = motionDuration(uAction);
      float phase = clamp(uActionTime / duration, 0.0, 1.0);
      float easeIn = smoothstep(0.0, 0.16, phase);
      float easeOut = uAction > 8.5 ? 1.0 : 1.0 - smoothstep(0.83, 1.0, phase);
      float strength = easeIn * easeOut;
      float shape = original;

      if (uAction > 0.5 && uAction < 1.5) {
        vec2 q = rotate2d(0.15 * sin(uActionTime * 2.1)) * p;
        shape = morphEllipse(q, vec2(0.60, 0.58));
        shape = morphUnion(
          shape,
          morphEllipse(q - vec2(-0.55, -0.16), vec2(0.13, 0.15)),
          0.10
        );
        float thoughtSmall = length(
          p - vec2(
            0.625 + 0.006 * cos(uActionTime * 2.6),
            0.17 + 0.01 * sin(uActionTime * 2.6)
          )
        ) - 0.028;
        float thoughtMedium = length(
          p - vec2(
            0.70 + 0.008 * cos(uActionTime * 2.35 + 0.7),
            0.255 + 0.014 * sin(uActionTime * 2.35 + 0.7)
          )
        ) - 0.047;
        float thoughtLarge = length(
          p - vec2(
            0.80 + 0.008 * cos(uActionTime * 2.1 + 1.4),
            0.365 + 0.018 * sin(uActionTime * 2.1 + 1.4)
          )
        ) - 0.07;
        shape = min(shape, min(thoughtSmall, min(thoughtMedium, thoughtLarge)));
      } else if (uAction > 2.5 && uAction < 3.5) {
        shape = morphEllipse(p, vec2(0.59, 0.57));
        shape = morphUnion(
          shape,
          morphEllipse(p - vec2(-0.54, -0.13), vec2(0.17, 0.18)),
          0.11
        );
        shape = morphUnion(
          shape,
          morphEllipse(p - vec2(0.53, 0.23), vec2(0.17, 0.18)),
          0.12
        );
        shape += 0.008 * sin(uActionTime * 6.0);
      } else if (uAction > 3.5 && uAction < 4.5) {
        vec2 q = rotate2d(-0.18 * sin(uActionTime * 2.0)) * (p - vec2(0.045, 0.0));
        shape = morphEllipse(q, vec2(0.59, 0.58));
        shape = morphUnion(
          shape,
          morphEllipse(q - vec2(-0.45, -0.39), vec2(0.19, 0.18)),
          0.12
        );
      } else if (uAction > 8.5) {
        // 처음부터 작은 구로 수축하지 않고, 겹친 큰 덩어리가 자연스럽게
        // 여러 조각으로 나뉘면서 각 조각의 최종 크기에 도달합니다.
        float splitProgress = smoothstep(0.04, 0.42, phase);
        float spread = smoothstep(0.10, 0.46, phase);
        float firstRadius = mix(0.585, 0.11, splitProgress);
        float secondRadius = mix(0.585, 0.20, splitProgress);
        float centerRadius = mix(0.585, 0.16, splitProgress);
        float fourthRadius = mix(0.585, 0.14, splitProgress);
        float fifthRadius = mix(0.585, 0.075, splitProgress);
        vec2 firstPoint = p - vec2(-0.70 * spread, 0.015 * spread);
        vec2 fifthPoint = p - vec2(0.66 * spread, 0.02 * spread);
        float first = organicCircleSDF(
          firstPoint,
          firstRadius,
          uActionTime,
          0.0,
          0.012 * splitProgress
        );
        float second = length(p - vec2(-0.37 * spread, 0.0)) - secondRadius;
        float center = length(p - vec2(0.025 * spread, 0.0)) - centerRadius;
        float fourth = length(p - vec2(0.37 * spread, 0.0)) - fourthRadius;
        float fifth = organicCircleSDF(
          fifthPoint,
          fifthRadius,
          uActionTime,
          2.4,
          0.009 * splitProgress
        );
        shape = min(min(min(first, second), min(center, fourth)), fifth);
      }

      shape += livingDeformation * 0.62;

      return mix(original, shape, strength);
    }

    void main() {
      float t = uTime;

      vec2 uv = vUv;
      vec2 p = uv - 0.5;
      p *= 2.0;
      p.x *= uAspect;

      // 거의 구체 형태 유지
      p.x *= 0.985;
      p.y *= 1.015;

      // 아주 약한 회전감
      float rot = sin(t * 0.14) * 0.028 * uMotion;
      p = rotate2d(rot) * p;

      float d = orbMotionSDF(p, t);

      // 내부 마스크
      float inside = 1.0 - smoothstep(0.0, 0.012, d);

      // 외곽 림
      float rim = 1.0 - smoothstep(0.0, 0.052, abs(d));

      // 바깥 글로우를 조금 더 부드럽게
      float outsideD = max(d, 0.0);
      float outerGlow = exp(-outsideD * 18.0);
      outerGlow *= 1.0 - smoothstep(0.025, 0.24, outsideD);

      // 가짜 구면 좌표
      float baseR = 0.585;
      vec2 sp = p / baseR;
      float rr = dot(sp, sp);
      float z = sqrt(max(0.0, 1.0 - rr));

      vec3 N = normalize(vec3(sp.x, sp.y, z));
      vec3 V = vec3(0.0, 0.0, 1.0);

      vec3 lightTop = normalize(vec3(-0.42, 0.82, 0.38));
      float diffuseTop = max(dot(N, lightTop), 0.0);

      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.45);

      // 내부 바디 톤: 기존보다 밝고 부드럽게
      float vertical = smoothstep(-0.82, 0.74, p.y);
      vec3 body = mix(uBodyBottom, uBodyTop, vertical * 0.92);
      body = mix(body, uBodyMid, 0.34);

      // 중앙의 응축된 색과 바깥 셸 색을 분리해 두 영역이 분명하게 읽히도록 함
      float radial = clamp(length(p) / baseR, 0.0, 1.0);
      float coreMask = 1.0 - smoothstep(0.24, 0.66, radial);
      float shellMask = smoothstep(0.48, 0.92, radial);
      vec3 coreColor = mix(uBodyMid, uBodyBottom, 0.34);
      body = mix(body, coreColor, coreMask * 0.52);
      body = mix(body, uBodyTop, shellMask * 0.2);

      // 밝은 배경에서도 중심의 푸른 색감이 탁해지지 않도록 그림자를 블루 톤으로 유지
      float centerShade = smoothstep(0.78, 0.08, length(p));
      body -= vec3(0.012, 0.022, 0.048) * centerShade;

      // 구면 입체감
      body += uBodyTop * diffuseTop * 0.11;
      body += vec3(0.030, 0.052, 0.090) * z * 0.28;

      // 내부 미세 생동감
      float innerPulse = 0.5 + 0.5 * sin(t * 0.65 + p.y * 3.0);
      vec3 innerShift = vec3(0.018, 0.048, 0.090) * innerPulse * 0.18;

      // 흰 배경에서 실루엣을 잡아 주는 스카이블루 외곽 림
      float purpleRim = fresnel * 0.66 + rim * 0.24;
      purpleRim *= smoothstep(-0.64, 0.9, p.y);

      // 아래 블루 림
      float bottomMask = smoothstep(0.14, -0.84, p.y);
      float bottomPulse = 0.88 + 0.12 * sin(t * 0.82);
      float bottomGlow = (fresnel * 0.88 + rim * 0.36) * bottomMask * bottomPulse;

      /*
        중앙 소프트 글로우
        - 위쪽 하얀 스팟 대신 중앙에 은은한 라벤더 빛
        - 너무 밝지 않지만 전체가 부드러워 보이게
      */
      vec2 centerGlowPos = vec2(0.0, 0.02);
      vec2 centerGlowUv = p - centerGlowPos;

      centerGlowUv.x *= 0.92;
      centerGlowUv.y *= 1.12;

      float centerGlow = 1.0 - smoothstep(0.0, 0.32, length(centerGlowUv));
      centerGlow *= inside;

      float centerDepth = smoothstep(0.72, 0.05, length(p));
      centerGlow *= centerDepth;

      float centerPulse = 0.92 + 0.08 * sin(t * 0.72);
      centerGlow *= centerPulse;

      // 기존보다 살짝 더 보이게
      centerGlow *= 0.2;

      vec3 color = body + innerShift;

      // 참고 이미지처럼 위쪽 가장자리에 유리광이 맺히는 광택 추가
      float glassHighlight = pow(diffuseTop, 4.5) * (0.24 + fresnel * 0.76);
      vec3 glassColor = mix(uRimPurple, uRimWhite, 0.78);
      color += glassColor * glassHighlight * (0.14 + uLightMode * 0.38);

      // 전체적으로 색감이 더 또렷하게 보이도록 강도 상승
      color += uRimPurple * purpleRim * 0.64;
      color += uBottomBlue * bottomGlow * (1.08 + uLightMode * 0.34);

      vec3 centerGlowColor = mix(uRimPurple, uRimWhite, 0.56);
      color += centerGlowColor * centerGlow * 1.12;

      // 흰 배경에서는 바깥 헤이즈를 얇게 유지해 가장자리가 흐려지지 않게 함
      color += uOuterGlow * outerGlow * (0.11 + uLightMode * 0.04);

      float alpha = inside;
      alpha = max(alpha, outerGlow * 0.16);
      alpha = clamp(alpha, 0.0, 1.0);

      gl_FragColor = vec4(color, alpha);
    }
  `;

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[3.2, 3.2]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
}

export function GarimReferenceOrb({
  size = 460,
  renderSize,
  className = '',
  background = 'transparent',
  speed = 0.95,
  motion = 0.78,
  themeMode = 'light',
  action = 'idle',
  actionSequence = 0,
}) {
  const isDark = themeMode === 'dark';
  const floatDuration = `${(Math.PI * 2) / (0.55 * Math.max(speed, 0.01))}s`;
  const numericSize = renderSize ?? (typeof size === 'number' ? size : 460);
  const cameraZoom = 120 * (numericSize / 460);

  return (
    <div
      className={`garim-reference-orb is-${themeMode} ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        background,
        '--orb-speed': speed,
        '--orb-float-duration': floatDuration,
        '--floor-glow-far': isDark ? 0.59 : 0.63,
        '--floor-glow-near': isDark ? 0.62 : 0.66,
        '--reflection-far': isDark ? 0.44 : 0.62,
        '--reflection-near': isDark ? 0.47 : 0.65,
      }}
    >
      <Canvas
        orthographic
        camera={{ zoom: cameraZoom, position: [0, 0, 5] }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <ResponsiveCamera zoom={cameraZoom} />
        <OrbPlane
          speed={speed}
          motion={motion}
          themeMode={themeMode}
          action={action}
          actionSequence={actionSequence}
        />
      </Canvas>

      <div className="garim-orb-reflection" />
      <div className="garim-orb-bottom-glow" />

      <style>{`
        .garim-reference-orb {
          position: relative;
          display: grid;
          place-items: center;
          isolation: isolate;
          overflow: visible;
          pointer-events: none;
        }

        .garim-reference-orb canvas {
          position: relative;
          z-index: 2;
        }

        .garim-orb-reflection {
          position: absolute;
          left: 50%;
          bottom: 4.5%;
          width: 27%;
          height: 13%;
          transform: translateX(-50%) scaleY(0.72);
          transform-origin: 50% 0%;
          border-radius: 50%;
          background:
            radial-gradient(
              ellipse at 50% 0%,
              rgba(233, 253, 255, 0.66) 0%,
              rgba(54, 233, 255, 0.42) 18%,
              rgba(22, 139, 255, 0.28) 42%,
              rgba(7, 93, 246, 0.12) 62%,
              rgba(7, 93, 246, 0) 80%
            );
          filter: blur(7px);
          opacity: 0.72;
          mask-image: linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.7) 38%, transparent 100%);
          -webkit-mask-image: linear-gradient(
            to bottom,
            black 0%,
            rgba(0, 0, 0, 0.7) 38%,
            transparent 100%
          );
          z-index: 1;
          animation: garimOrbReflection var(--orb-float-duration) linear infinite;
        }

        .garim-reference-orb.is-dark .garim-orb-reflection {
          background:
            radial-gradient(
              ellipse at 50% 0%,
              rgba(246, 240, 255, 0.44) 0%,
              rgba(165, 139, 255, 0.34) 22%,
              rgba(78, 107, 255, 0.2) 48%,
              rgba(78, 107, 255, 0) 80%
            );
        }

        .garim-orb-bottom-glow {
          position: absolute;
          left: 50%;
          bottom: 13.5%;
          width: 34%;
          height: 7%;
          transform: translateX(-50%);
          border-radius: 999px;
          background: radial-gradient(
            ellipse,
            rgba(6, 60, 200, 0.42) 0%,
            rgba(7, 93, 246, 0.22) 38%,
            rgba(54, 233, 255, 0.1) 62%,
            rgba(54, 233, 255, 0) 78%
          );
          filter: blur(13px);
          z-index: 1;
          animation: garimOrbFloorGlow var(--orb-float-duration) linear infinite;
        }

        .garim-reference-orb.is-dark .garim-orb-bottom-glow {
          bottom: 14.5%;
          width: 30%;
          height: 6%;
          background: radial-gradient(
            ellipse,
            rgba(78, 107, 255, 0.56) 0%,
            rgba(139, 108, 255, 0.22) 42%,
            rgba(78, 107, 255, 0) 76%
          );
          filter: blur(17px);
        }

        @keyframes garimOrbFloorGlow {
          0%, 50%, 100% {
            opacity: var(--floor-glow-near);
            transform: translateX(-50%) scaleX(1);
          }

          25% {
            opacity: var(--floor-glow-far);
            transform: translateX(-50%) scaleX(0.88);
          }

          75% {
            opacity: var(--floor-glow-near);
            transform: translateX(-50%) scaleX(1.08);
          }
        }

        @keyframes garimOrbReflection {
          0%, 50%, 100% {
            transform: translateX(-50%) scaleX(1) scaleY(0.72);
            opacity: var(--reflection-near);
          }

          25% {
            transform: translateX(-50%) scaleX(0.9) scaleY(0.66);
            opacity: var(--reflection-far);
          }

          75% {
            transform: translateX(-50%) scaleX(1.06) scaleY(0.76);
            opacity: var(--reflection-near);
          }
        }
      `}</style>
    </div>
  );
}

export default function GarimReferenceOrbPreview() {
  return (
    <div
      style={{
        minHeight: '100vh',
        margin: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(circle at 50% 48%, #EFF6FF 0%, #FFFFFF 58%, #F8FAFC 100%)',
      }}
    >
      <GarimReferenceOrb size={460} speed={0.95} motion={0.78} />
    </div>
  );
}
