import React from 'react'
import { useNavigate } from 'react-router-dom';

const Errorpage = () => {
  const navigate = useNavigate();

  return (
    <section className='relative flex flex-col items-center justify-center h-screen bg-pri p-8 gap-5'>
      <p className='text-[40px] text-white text-center'>
        <span className='text-red-600 text-[60px] font-semibold'>Oops!</span> We couldn’t find the page you were looking for
      </p>
      <div className='flex items-center gap-5'>
        <button
          onClick={() => navigate('/')}
          className='btn-p'
        >
          Back to home
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className='btn-p'
        >
          Your dashboard
        </button>
      </div>
    </section>
  );
}

export default Errorpage;