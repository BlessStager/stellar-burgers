import React, { FC } from 'react';
import { Link, NavLink, useMatch } from 'react-router-dom';
import clsx from 'clsx';

import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';

export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => {
  const isIngredientDetailsRoute = Boolean(useMatch('/ingredients/:id'));

  const linkStyle = { textDecoration: 'none', color: 'inherit' };

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <NavLink
            to='/'
            end
            style={linkStyle}
            className={({ isActive }) =>
              clsx(
                styles.link,
                (isActive || isIngredientDetailsRoute) && styles.link_active
              )
            }
          >
            {({ isActive }) => {
              const active = isActive || isIngredientDetailsRoute;
              return (
                <>
                  <BurgerIcon type={active ? 'primary' : 'secondary'} />
                  <p className='text text_type_main-default ml-2 mr-10'>
                    Конструктор
                  </p>
                </>
              );
            }}
          </NavLink>

          <NavLink
            to='/feed'
            style={linkStyle}
            className={({ isActive }) =>
              clsx(styles.link, isActive && styles.link_active)
            }
          >
            {({ isActive }) => (
              <>
                <ListIcon type={isActive ? 'primary' : 'secondary'} />
                <p className='text text_type_main-default ml-2'>
                  Лента заказов
                </p>
              </>
            )}
          </NavLink>
        </div>

        <div className={styles.logo}>
          <Link to='/' style={linkStyle}>
            <Logo className='' />
          </Link>
        </div>

        <NavLink
          to='/profile'
          style={linkStyle}
          className={({ isActive }) =>
            clsx(
              styles.link,
              styles.link_position_last,
              isActive && styles.link_active
            )
          }
        >
          {({ isActive }) => (
            <>
              <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
              <p className='text text_type_main-default ml-2'>
                {userName || 'Личный кабинет'}
              </p>
            </>
          )}
        </NavLink>
      </nav>
    </header>
  );
};
