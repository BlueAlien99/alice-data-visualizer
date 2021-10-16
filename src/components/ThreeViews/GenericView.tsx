import { Canvas } from '@react-three/fiber';
import { ComponentProps, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from 'hooks/redux';
import { selectCurrentStyle } from 'features/styles/stylesSlice';
import TakeScreenshot from './TakeScreenshot';

const ViewStyles = styled.div<{ textColor: string }>`
    position: relative;
    min-width: 0;
    min-height: 0;

    .label {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        color: ${props => props.textColor};
        z-index: 100;
    }

    .actions {
        position: absolute;
        right: 0;
        opacity: 0.67;
        z-index: 100;
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
    label: string;
    className?: string;
    children?: ReactNode;
}

function GenericView({ label, className, children }: Props): JSX.Element {
    const [screenshotRequested, setScreenshotRequested] = useState(false);

    const style = useAppSelector(selectCurrentStyle);

    const requestScreenshot = () => setScreenshotRequested(true);
    const screenshotTaken = () => setScreenshotRequested(false);

    return (
        <ViewStyles className={className} textColor={style.overlayColor}>
            <span className="label">{label}</span>
            <div className="actions">
                <button type="button" onClick={requestScreenshot}>
                    Save as PNG
                </button>
            </div>
            <Canvas frameloop="demand" gl={rendererProps} onCreated={onCreated}>
                <color attach="background" args={[style.clearColor]} />
                {screenshotRequested && <TakeScreenshot label={label} done={screenshotTaken} />}
                {children}
            </Canvas>
        </ViewStyles>
    );
}

export default GenericView;
