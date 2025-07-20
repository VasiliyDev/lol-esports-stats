<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { classificationApi, classificationQueryKeys, prepareBulkUpdateData, createParametersObject } from '@/api/classifications.js';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const toast = useToast();

const classificationId = computed(() => parseInt(route.params.id));

// Modals state
const showRenameModal = ref(false);
const showAddParameterModal = ref(false);
const showDeleteParameterModal = ref(false);
const showRenameParameterModal = ref(false);

// Form data
const renameClassificationData = ref({ name: '' });
const newParameterName = ref('');
const deleteParameterData = ref({ id: null, name: '' });
const renameParameterData = ref({ id: null, name: '' });

// Champions data state
const championsData = ref([]);
const hasUnsavedChanges = ref(false);

// Get classification full info
const { data: classificationInfo, isLoading, error, refetch } = useQuery({
  queryKey: classificationQueryKeys.fullInfo(classificationId.value),
  queryFn: () => classificationApi.getClassificationFullInfo(classificationId.value),
  enabled: computed(() => !!classificationId.value),
});

// Mutations
const { mutateAsync: renameClassificationMutation, isPending: isPendingRenameClassification } = useMutation({
  mutationFn: ({ id, name }) => classificationApi.renameClassification(id, name),
});

const { mutateAsync: addParameterMutation, isPending: isPendingAddParameter } = useMutation({
  mutationFn: classificationApi.createClassificationParameter,
});

const { mutateAsync: deleteParameterMutation, isPending: isPendingDeleteParameter } = useMutation({
  mutationFn: classificationApi.deleteClassificationParameter,
});

const { mutateAsync: renameParameterMutation, isPending: isPendingRenameParameter } = useMutation({
  mutationFn: ({ id, name }) => classificationApi.updateClassificationParameter(id, { name }),
});

const { mutateAsync: saveChampionsMutation, isPending: isPendingSaveChampions } = useMutation({
  mutationFn: classificationApi.updateClassificationChampionParameters,
});

// Watch for data changes to initialize champions data


const classification = computed(() => classificationInfo.value?.classification);
const parameters = computed(() => classification.value?.parameters || []);

// Initialize champions data for editing
const initializeChampionsData = (data) => {
  const classificationParams = data.classification?.parameters || [];
  
  championsData.value = data.champions.map(champion => ({
    ...champion,
    parameterValues: classificationParams.map(param => ({
      parameter_id: param.id,
      parameter_name: param.name,
      value: champion.classification_stats[param.name] || 0
    }))
  }));
  console.log(championsData.value, 'haha')
  hasUnsavedChanges.value = false;
};

// Update parameter value for a champion
const updateChampionParameter = (championId, parameterId, value) => {
  const champion = championsData.value.find(c => c.id === championId);
  if (champion) {
    const paramValue = champion.parameterValues.find(pv => pv.parameter_id === parameterId);
    if (paramValue) {
      paramValue.value = parseFloat(value) || 0;
      hasUnsavedChanges.value = true;
    }
  }
};

// Generate random values for all parameters with 0 values
const generateRandomValues = () => {
  championsData.value.forEach(champion => {
    champion.parameterValues.forEach(paramValue => {
      if (paramValue.value === 0) {
        paramValue.value = Math.floor(Math.random() * 10) + 1; // Random number from 1 to 10
      }
    });
  });
  hasUnsavedChanges.value = true;
  toast.success('Random values generated for parameters with 0 values!');
};

// Modal handlers
const openRenameModal = () => {
  renameClassificationData.value.name = classification.value.name;
  showRenameModal.value = true;
};

const openAddParameterModal = () => {
  newParameterName.value = '';
  showAddParameterModal.value = true;
};

const openDeleteParameterModal = (parameter) => {
  deleteParameterData.value = { id: parameter.id, name: parameter.name };
  showDeleteParameterModal.value = true;
};

const openRenameParameterModal = (parameter) => {
  renameParameterData.value = { id: parameter.id, name: parameter.name };
  showRenameParameterModal.value = true;
};

// Form handlers
const handleRenameClassification = async () => {
  if (!renameClassificationData.value.name.trim()) {
    toast.error('Classification name is required');
    return;
  }
  try {
    const data = await renameClassificationMutation({
      id: classificationId.value,
      name: renameClassificationData.value.name.trim()
    });
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.fullInfo(classificationId.value) });
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.all });
    toast.success(`Classification renamed to "${data.data.name}" successfully!`);
    showRenameModal.value = false;
  } catch (error) {
    toast.error(`Error renaming classification: ${error.message}`);
  }
};

const handleAddParameter = async () => {
  if (!newParameterName.value.trim()) {
    toast.error('Parameter name is required');
    return;
  }
  try {
    const data = await addParameterMutation({
      classification_id: classificationId.value,
      name: newParameterName.value.trim()
    });
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.fullInfo(classificationId.value) });
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.all });
    toast.success(`Parameter "${data.data.name}" added successfully!`);
    showAddParameterModal.value = false;
    newParameterName.value = '';
    refetch();
  } catch (error) {
    toast.error(`Error adding parameter: ${error.message}`);
  }
};

const handleDeleteParameter = async () => {
  try {
    await deleteParameterMutation(deleteParameterData.value.id);
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.fullInfo(classificationId.value) });
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.all });
    toast.success('Parameter deleted successfully!');
    showDeleteParameterModal.value = false;
    refetch();
  } catch (error) {
    toast.error(`Error deleting parameter: ${error.message}`);
  }
};

const handleRenameParameter = async () => {
  if (!renameParameterData.value.name.trim()) {
    toast.error('Parameter name is required');
    return;
  }
  try {
    const data = await renameParameterMutation({
      id: renameParameterData.value.id,
      name: renameParameterData.value.name.trim()
    });
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.fullInfo(classificationId.value) });
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.all });
    toast.success(`Parameter renamed to "${data.data.name}" successfully!`);
    showRenameParameterModal.value = false;
    refetch();
  } catch (error) {
    toast.error(`Error renaming parameter: ${error.message}`);
  }
};

const handleSaveChampions = async () => {
  const updateData = prepareBulkUpdateData(
    classificationId.value,
    championsData.value.map(champion => ({
      champion_id: champion.id,
      parameters: createParametersObject(champion.parameterValues)
    }))
  );
  
  try {
    await saveChampionsMutation(updateData);
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.fullInfo(classificationId.value) });
    toast.success('Champions data saved successfully!');
    hasUnsavedChanges.value = false;
  } catch (error) {
    toast.error(`Error saving champions data: ${error.message}`);
  }
};

const resetChanges = () => {
  if (classificationInfo.value) {
    initializeChampionsData(classificationInfo.value);
  }
};

watch(classificationInfo, (newData) => {
  if (newData) {
    initializeChampionsData(newData);
  }
}, { immediate: true });

</script>

<template>
  <div class="classification-detail">
    <div class="page-header">
      <div>
        <router-link to="/classifications" class="back-link">← Back to Classifications</router-link>
        <h1 v-if="classification">{{ classification.name }}</h1>
        <h1 v-else>Loading...</h1>
      </div>
      <div class="header-actions">
        <button v-if="classification" class="action-button secondary" @click="openRenameModal">
          Rename Classification
        </button>
        <button v-if="classification" class="action-button secondary" @click="openAddParameterModal">
          Add Parameter
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Loading classification data...</div>
    <div v-else-if="error" class="error">Error loading classification: {{ error.message }}</div>
    
    <div v-else-if="classificationInfo" class="classification-content">
      <!-- Parameters Section -->
      <div class="parameters-section">
        <h2>Parameters ({{ parameters.length }})</h2>
        <div v-if="parameters.length" class="parameters-list">
          <div v-for="parameter in parameters" :key="parameter.id" class="parameter-card">
            <span class="parameter-name">{{ parameter.name }}</span>
            <div class="parameter-actions">
              <button class="action-button small secondary" @click="openRenameParameterModal(parameter)">
                Rename
              </button>
              <button class="action-button small danger" @click="openDeleteParameterModal(parameter)">
                Delete
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-parameters">
          No parameters yet. Add your first parameter!
        </div>
      </div>

      <!-- Champions Table Section -->
      <div class="champions-section">
        <div class="section-header">
          <h2>Champions Data ({{ championsData.length }})</h2>
          <div class="champions-actions">
            <button v-if="parameters.length && championsData.length" 
                    class="action-button generate-random" 
                    @click="generateRandomValues"
                    :disabled="isPendingSaveChampions">
              Generate Random
            </button>
            <button v-if="hasUnsavedChanges" 
                    class="action-button secondary" 
                    @click="resetChanges"
                    :disabled="isPendingSaveChampions">
              Reset Changes
            </button>
            <button class="action-button primary" 
                    @click="handleSaveChampions"
                    :disabled="!hasUnsavedChanges || isPendingSaveChampions">
              {{ isPendingSaveChampions ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <div v-if="parameters.length && championsData.length" class="champions-table-container">
          <table class="champions-table">
            <thead>
              <tr>
                <th class="champion-name-col">Champion</th>
                <th class="champion-role-col">Role</th>
                <th v-for="parameter in parameters" :key="parameter.id" class="parameter-col">
                  {{ parameter.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="champion in championsData" :key="champion.id">
                <td class="champion-name">
                  <div class="champion-info">
                    <img v-if="champion.image" 
                         :src="champion.image" 
                         :alt="champion.name" 
                         class="champion-avatar" />
                    <span>{{ champion.name }}</span>
                  </div>
                </td>
                <td class="champion-role">{{ champion.role }}</td>
                <td v-for="paramValue in champion.parameterValues" :key="paramValue.parameter_id">
                  <input 
                    type="number" 
                    step="0.1"
                    :value="paramValue.value"
                    @input="updateChampionParameter(champion.id, paramValue.parameter_id, $event.target.value)"
                    class="parameter-input"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!parameters.length" class="no-parameters">
          Add parameters first to start entering champion data.
        </div>
        
        <div v-else class="no-champions">
          No champions data available.
        </div>
      </div>
    </div>

    <!-- Rename Classification Modal -->
    <div v-if="showRenameModal" class="modal-overlay" @click="showRenameModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Rename Classification</h3>
          <button class="close-button" @click="showRenameModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Classification Name</label>
            <input 
              v-model="renameClassificationData.name" 
              type="text" 
              placeholder="Enter new name"
              @keyup.enter="handleRenameClassification"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button secondary" @click="showRenameModal = false">Cancel</button>
          <button class="action-button primary" 
                  @click="handleRenameClassification"
                  :disabled="isPendingRenameClassification">
            {{ isPendingRenameClassification ? 'Renaming...' : 'Rename' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Parameter Modal -->
    <div v-if="showAddParameterModal" class="modal-overlay" @click="showAddParameterModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add New Parameter</h3>
          <button class="close-button" @click="showAddParameterModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Parameter Name</label>
            <input 
              v-model="newParameterName" 
              type="text" 
              placeholder="Enter parameter name"
              @keyup.enter="handleAddParameter"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button secondary" @click="showAddParameterModal = false">Cancel</button>
          <button class="action-button primary" 
                  @click="handleAddParameter"
                  :disabled="isPendingAddParameter">
            {{ isPendingAddParameter ? 'Adding..' : 'Add Parameter' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Parameter Modal -->
    <div v-if="showDeleteParameterModal" class="modal-overlay" @click="showDeleteParameterModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Parameter</h3>
          <button class="close-button" @click="showDeleteParameterModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the parameter "{{ deleteParameterData.name }}"?</p>
          <p class="warning">This action cannot be undone and will also delete all champion data for this parameter.</p>
        </div>
        <div class="modal-footer">
          <button class="action-button secondary" @click="showDeleteParameterModal = false">Cancel</button>
          <button class="action-button danger" 
                  @click="handleDeleteParameter"
                  :disabled="isPendingDeleteParameter">
            {{ isPendingDeleteParameter ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Rename Parameter Modal -->
    <div v-if="showRenameParameterModal" class="modal-overlay" @click="showRenameParameterModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Rename Parameter</h3>
          <button class="close-button" @click="showRenameParameterModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Parameter Name</label>
            <input 
              v-model="renameParameterData.name" 
              type="text" 
              placeholder="Enter new parameter name"
              @keyup.enter="handleRenameParameter"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button secondary" @click="showRenameParameterModal = false">Cancel</button>
          <button class="action-button primary" 
                  @click="handleRenameParameter"
                  :disabled="isPendingRenameParameter">
            {{ isPendingRenameParameter ? 'Renaming...' : 'Rename' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.classification-detail {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  
  h1 {
    margin: 5px 0 0 0;
    color: #333;
  }
}

.back-link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
}

.header-actions {
  display: flex;
  gap: 10px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #e74c3c;
}

.classification-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.parameters-section, .champions-section {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  h2 {
    margin: 0 0 15px 0;
    color: #333;
  }
}

.parameters-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}

.parameter-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.parameter-name {
  font-weight: 500;
  color: #333;
}

.parameter-actions {
  display: flex;
  gap: 5px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.champions-actions {
  display: flex;
  gap: 10px;
}

.champions-table-container {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.champions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  th, td {
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    text-align: left;
  }
  
  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  tr:hover {
    background: #f8f9fa;
  }
}

.champion-name-col {
  min-width: 150px;
}

.champion-role-col {
  min-width: 100px;
}

.parameter-col {
  min-width: 100px;
  text-align: center;
}

.champion-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.champion-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.champion-name {
  font-weight: 500;
  color: #333;
}

.champion-role {
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
}

.parameter-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
}

.no-parameters, .no-champions {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: background-color 0.2s;
  
  &.primary {
    background-color: #007bff;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #0056b3;
    }
  }
  
  &.secondary {
    background-color: #6c757d;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #545b62;
    }
  }
  
  &.danger {
    background-color: #dc3545;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #c82333;
    }
  }
  
  &.generate-random {
    background-color: #28a745;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #218838;
    }
  }
  
  &.small {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// Modal styles (same as in ClassificationsList.vue)
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  
  h3 {
    margin: 0;
  }
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  
  &:hover {
    color: #333;
  }
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
  }
  
  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }
  }
}

.warning {
  color: #dc3545;
  font-weight: bold;
  font-size: 14px;
}
</style>