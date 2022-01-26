import { Canvas, useFrame } from '@react-three/fiber';
import { ComponentProps, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls, useContextBridge } from '@react-three/drei';
import { ReactReduxContext } from 'react-redux';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { selectCurrentStyle } from 'features/styles/stylesSlice';
import { screenshotRequested } from 'features/screenshot/screenshotSlice';
import { SupportedViewIds } from 'features/screenshot/dimensions';
import ScreenshotManager from './three/ScreenshotManager';
import CameraManager from './three/CameraManager';

const ViewStyles = styled.div<{ textColor: string; backgroundColor: string }>`
    position: relative;
    min-width: 0;
    min-height: 0;

    .overlay {
        position: absolute;
        color: ${props => props.textColor};
        background-color: ${props => props.backgroundColor};
        opacity: 0.2;
        z-index: 100;

        &:hover {
            opacity: 0.8;
        }
    }

    .label {
        left: 50%;
        transform: translateX(-50%);
    }

    .actions {
        display: flex;
        flex-direction: column;
        right: 0;
    }
`;

type CanvasProp<T extends keyof U, U = ComponentProps<typeof Canvas>> = U[T];

const rendererProps: CanvasProp<'gl'> = {
    antialias: false,
};

const onCreated: CanvasProp<'onCreated'> = state => {
    state.camera.lookAt(0, 0, 0);
};

interface Props {
    viewId: SupportedViewIds;
    label: string;
    controlsProps?: ComponentProps<typeof OrbitControls>;
    className?: string;
    children?: ReactNode;
}

function Inside({
    children,
    controlsProps,
    cameraControlsContainer,
    orbitControls,
    viewId,
    label,
    clearColor,
    setOrbitControls,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOrbitControls: (x: any) => void;
    clearColor: string;
    viewId: number;
    label: string;
    children: ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controlsProps: any;
    orbitControls: OrbitControlsImpl | null;
    cameraControlsContainer: HTMLDivElement | null;
}): JSX.Element {
    useFrame(({ gl, scene, camera }) => {
        gl.render(scene, camera);
        // console.log(store.getState().aliceData.trackCount);
        window.kkk = performance.now();
    }, 1);

    return (
        <>
            <color attach="background" args={[clearColor]} />
            <ScreenshotManager viewId={viewId} label={label} />
            {cameraControlsContainer && orbitControls && (
                <CameraManager
                    cameraControlsContainer={cameraControlsContainer}
                    orbitControls={orbitControls}
                />
            )}
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <OrbitControls ref={setOrbitControls} {...controlsProps} />
            {children}
        </>
    );
}

function GenericView({ viewId, label, controlsProps, className, children }: Props): JSX.Element {
    const dispatch = useAppDispatch();

    const requestPNGScreenshot = () => dispatch(screenshotRequested({ viewId, variant: 'png' }));
    const requestSVGScreenshot = () => dispatch(screenshotRequested({ viewId, variant: 'svg' }));

    const style = useAppSelector(selectCurrentStyle);

    const [cameraControlsContainer, setCameraControlsContainer] = useState<HTMLDivElement | null>(
        null
    );
    const [orbitControls, setOrbitControls] = useState<OrbitControlsImpl | null>(null);

    const ContextBridge = useContextBridge(ReactReduxContext);

    return (
        <ViewStyles
            className={className}
            textColor={style.overlayColor}
            backgroundColor={style.clearColor}
        >
            <div className="overlay camera" ref={setCameraControlsContainer} />
            <span className="overlay label">{label}</span>
            <div className="overlay actions">
                <button type="button" onClick={requestPNGScreenshot}>
                    Save as PNG
                </button>
                <button type="button" onClick={requestSVGScreenshot}>
                    Save as SVG
                </button>
            </div>
            <Canvas linear frameloop="demand" gl={rendererProps} onCreated={onCreated}>
                <ContextBridge>
                    <Inside
                        cameraControlsContainer={cameraControlsContainer}
                        clearColor={style.clearColor}
                        controlsProps={controlsProps}
                        label={label}
                        orbitControls={orbitControls}
                        setOrbitControls={setOrbitControls}
                        viewId={viewId}
                    >
                        {children}
                    </Inside>
                </ContextBridge>
            </Canvas>
        </ViewStyles>
    );
}

export default GenericView;
