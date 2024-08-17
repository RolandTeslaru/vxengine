import { Button } from '@geist-ui/core';

const SplineEditorUI = ({ selectedSpline, setSelectedSpline }) => (
    <div className="w-full">
      <p className='font-sans-menlo text-center'>Spline Editor</p>
      <Button
      >
        <p className='text-nowrap font-sans-menlo text-sm '>
          Add Spline
        </p>
      </Button>
    </div>
  );
  

export default SplineEditorUI;