import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { listEmployees } from '../shared/api/employees.api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    let active = true;

    listEmployees({ isActive: 'true' })
      .then((data) => {
        if (!active) return;

        setEmployees(data);

        const defaultEmployee = data.find((employee) => employee.role === 'employee') ?? data[0] ?? null;
        setCurrentUserId(defaultEmployee?._id ?? null);
      })
      .catch(() => {
        if (!active) return;
        setEmployees([]);
        setCurrentUserId(null);
      })
      .finally(() => {
        if (active) {
          setLoadingUsers(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const currentUser = useMemo(() => {
    const selected = employees.find((employee) => employee._id === currentUserId);

    if (selected) {
      return {
        id: selected._id,
        name: selected.name,
        role: selected.role,
        email: selected.email,
        department: selected.department,
        position: selected.position,
        pointBalance: selected.pointBalance
      };
    }

    return {
      id: null,
      name: 'Sin usuario seleccionado',
      role: 'employee',
      email: '',
      department: '',
      position: '',
      pointBalance: 0
    };
  }, [employees, currentUserId]);

  const switchRole = (role) => {
    const roleUsers = employees.filter((employee) => employee.role === role);

    if (roleUsers.length > 0) {
      setCurrentUserId(roleUsers[0]._id);
    }
  };

  const selectUser = (userId) => {
    setCurrentUserId(userId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        selectUser,
        users: employees,
        loadingUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
